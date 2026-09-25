import { ApiError, GoogleGenAI, Type } from "@google/genai";
import {
  GeminiAnalysis,
  MAX_SIZE_CM,
  TATTOO_CATEGORIES,
  geminiAnalysisSchema,
} from "../validation/aiAnalysis.schema";

const GEMINI_TIMEOUT_MS = 45_000;
const GEMINI_RETRY_DELAY_MS = 1_500;

const isRetryable = (error: unknown) =>
  error instanceof ApiError && error.status >= 500;

export class AiAnalysisError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface InventoryOption {
  id: string;
  name: string;
  category: string;
  unit: string;
}

export interface AnalyzeTattooParams {
  image: { data: Buffer; mimeType: string };
  trusted: {
    bodyPart?: string;
    widthCm?: number;
    heightCm?: number;
  };
  inventory?: InventoryOption[];
}

function buildPrompt({ trusted, inventory }: AnalyzeTattooParams) {
  const knowsSize =
    trusted.widthCm !== undefined && trusted.heightCm !== undefined;
  const facts = [
    trusted.bodyPart
      ? `- Body part: ${trusted.bodyPart}`
      : "- Body part: not specified",
    knowsSize
      ? `- Tattoo size: ${trusted.widthCm} cm wide x ${trusted.heightCm} cm tall`
      : "- Tattoo size: not specified",
  ].join("\n");

  const inventorySection = inventory
    ? `
AVAILABLE SHOP INVENTORY (only recommend items from this exact list, using
the exact "id" value; never invent items or ids):
${inventory.length > 0 ? JSON.stringify(inventory) : "(empty — return items: [])"}
`
    : "";

  return `
You are a tattoo analysis assistant. Analyze the tattoo image together with
trusted data from the application.

TRUSTED APPLICATION DATA (use as fact, do not re-guess):
${facts}
${inventorySection}
TASK:
1. isTattooDesign: false only if the image is clearly not a tattoo or tattoo
   design (e.g. a random photo with no artwork); otherwise true.
2. category: the art style, from the visual style only. Choose ONE of:
   ${TATTOO_CATEGORIES.join(", ")}.
3. complexity (1-5) from visible line work, shading, detail, texture and
   number of elements — never from category or size alone. A small tattoo can
   be 4-5 if highly detailed; a large tattoo can be 1-2 if simple.
   1 = very simple lines, 2 = simple, 3 = moderate detail/shading,
   4 = high detail with refined shading, 5 = extremely intricate.
4. isColored: true if any color other than black/gray is visible.
5. ${
    knowsSize
      ? "estimatedWidthCm / estimatedHeightCm: repeat the trusted size."
      : `estimatedWidthCm / estimatedHeightCm: a realistic physical size in cm
   for this design${trusted.bodyPart ? " on the given body part" : ""}, max ${MAX_SIZE_CM}.`
  }
6. estimatedHours: realistic tattooing time for this size, considering
   complexity, color, body part and visual density.
7. estimatedSessions: realistic number of sittings.
${
  inventory
    ? `8. items: materials from AVAILABLE SHOP INVENTORY likely needed, each with
   estimatedQuantity. Only recommend colored inks if isColored is true and only
   colors plausibly in the image.`
    : "8. items: return an empty array."
}

RULES:
- Never calculate any price, cost, or currency amount.
- Return JSON only, matching the response schema.
`;
}

function buildResponseSchema(inventory?: InventoryOption[]) {
  const itemsSchema =
    inventory && inventory.length > 0
      ? {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              inventoryItemId: {
                type: Type.STRING,
                enum: inventory.map((i) => i.id),
              },
              estimatedQuantity: { type: Type.NUMBER, minimum: 1 },
            },
            required: ["inventoryItemId", "estimatedQuantity"],
          },
        }
      : { type: Type.ARRAY, items: { type: Type.STRING }, maxItems: "0" };

  return {
    type: Type.OBJECT,
    properties: {
      isTattooDesign: { type: Type.BOOLEAN },
      category: { type: Type.STRING, enum: [...TATTOO_CATEGORIES] },
      complexity: { type: Type.INTEGER, minimum: 1, maximum: 5 },
      isColored: { type: Type.BOOLEAN },
      estimatedWidthCm: { type: Type.NUMBER, minimum: 1, maximum: MAX_SIZE_CM },
      estimatedHeightCm: {
        type: Type.NUMBER,
        minimum: 1,
        maximum: MAX_SIZE_CM,
      },
      estimatedHours: { type: Type.NUMBER, minimum: 0.25 },
      estimatedSessions: { type: Type.INTEGER, minimum: 1 },
      items: itemsSchema,
    },
    required: [
      "isTattooDesign",
      "category",
      "complexity",
      "isColored",
      "estimatedWidthCm",
      "estimatedHeightCm",
      "estimatedHours",
      "estimatedSessions",
      "items",
    ],
  };
}

export class TattooAnalysisService {
  static async analyze(params: AnalyzeTattooParams): Promise<GeminiAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      throw new AiAnalysisError(503, "AI analysis is not available right now.");
    }

    const genAI = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const request = () =>
      genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: [
          {
            inlineData: {
              data: params.image.data.toString("base64"),
              mimeType: params.image.mimeType,
            },
          },
          { text: buildPrompt(params) },
        ],
        config: {
          abortSignal: controller.signal,
          responseMimeType: "application/json",
          responseSchema: buildResponseSchema(params.inventory),
        },
      });

    let rawText: string | undefined;
    try {
      let result;
      try {
        result = await request();
      } catch (error) {
        if (!isRetryable(error) || controller.signal.aborted) throw error;
        console.warn(
          "Gemini request failed, retrying once:",
          (error as ApiError).status,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, GEMINI_RETRY_DELAY_MS),
        );
        result = await request();
      }
      rawText = result.text;
    } catch (error) {
      console.error(
        "Gemini request failed:",
        error instanceof ApiError ? error.status : "",
        error instanceof Error ? error.message.slice(0, 500) : error,
      );
      if (controller.signal.aborted) {
        throw new AiAnalysisError(
          504,
          "The AI took too long to respond. Please try again.",
        );
      }
      if (
        error instanceof ApiError &&
        (error.status === 429 || error.status === 503)
      ) {
        throw new AiAnalysisError(
          error.status,
          "The AI service is busy right now. Please wait a moment and try again.",
        );
      }
      throw new AiAnalysisError(
        502,
        "Could not analyze this tattoo right now. Please try again in a moment.",
      );
    } finally {
      clearTimeout(timer);
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(rawText ?? "");
    } catch {
      console.error("Gemini returned non-JSON output:", rawText?.slice(0, 500));
      throw new AiAnalysisError(
        502,
        "The AI returned an unreadable result. Please try again.",
      );
    }

    const parsed = geminiAnalysisSchema.safeParse(rawJson);
    if (!parsed.success) {
      console.error("Gemini analysis failed validation:", parsed.error.issues);
      throw new AiAnalysisError(
        502,
        "The AI returned an unreadable result. Please try again.",
      );
    }
    return parsed.data;
  }
}
