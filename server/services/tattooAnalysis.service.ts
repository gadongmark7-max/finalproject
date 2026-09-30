import { ApiError, GoogleGenAI, Type } from "@google/genai";
import {
  DETECTED_BODY_PARTS,
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
  inks?: InventoryOption[];
}

function buildPrompt({ trusted, inventory, inks }: AnalyzeTattooParams) {
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

  const inkSection =
    inks && inks.length > 0
      ? `
INK INVENTORY (tattoo inks the shop stocks, by name; use the exact "id"):
${JSON.stringify(inks.map(({ id, name }) => ({ id, name })))}
`
      : "";

  return `
You are a tattoo analysis assistant. Analyze the tattoo image together with
trusted data from the application.

TRUSTED APPLICATION DATA (use as fact, do not re-guess):
${facts}
${inventorySection}${inkSection}
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
   estimatedQuantity. Ink measured in ml or L is NOT in this list and is
   covered by estimatedInkMl; only recommend an ink-related item from this
   list if it plausibly applies.`
    : "8. items: return an empty array."
}
9. estimatedInkMl: the total volume of tattoo ink in milliliters (all colors
   combined, including ink poured into caps and discarded) realistically
   consumed for this design at this size, based on the inked area, how much of
   it is solid fill or shading versus line work, and color. This is a volume
   only, not a price.
10. detectedBodyPart: judge only from what is visible in the image, ignoring
   the trusted body part above. If the tattoo is shown on a person's body,
   the body part it is on, choosing ONE of: ${DETECTED_BODY_PARTS.filter((p) => p !== "Unknown").join(", ")}.
   If the image is a flat design, stencil or drawing with no body visible, or
   the body part cannot be identified, return "Unknown".
${
  inks && inks.length > 0
    ? `11. inkUsage: every ink color visible in this tattoo that matches an ink in
   INK INVENTORY by name (e.g. black linework and an ink named black, red
   roses and an ink named red). For each, the "id" as inkItemId and percent:
   its approximate share of the total ink volume (all percents together about
   100). Skip a color if no ink name clearly matches it, or if two or more
   inks match that color equally well. Return [] if nothing clearly matches.`
    : "11. inkUsage: return an empty array."
}

RULES:
- Never calculate any price, cost, or currency amount.
- Return JSON only, matching the response schema.
`;
}

function buildResponseSchema(
  inventory?: InventoryOption[],
  inks?: InventoryOption[],
) {
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
      estimatedInkMl: { type: Type.NUMBER, minimum: 0.1, maximum: 500 },
      items: itemsSchema,
      detectedBodyPart: { type: Type.STRING, enum: [...DETECTED_BODY_PARTS] },
      inkUsage:
        inks && inks.length > 0
          ? {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  inkItemId: { type: Type.STRING, enum: inks.map((i) => i.id) },
                  percent: { type: Type.NUMBER, minimum: 1, maximum: 100 },
                },
                required: ["inkItemId", "percent"],
              },
            }
          : { type: Type.ARRAY, items: { type: Type.STRING }, maxItems: "0" },
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
      "estimatedInkMl",
      "items",
      "detectedBodyPart",
      "inkUsage",
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
          responseSchema: buildResponseSchema(params.inventory, params.inks),
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
