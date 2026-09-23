import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { InventoryService } from "../services/inventory.service";
import {
  AiAnalysisError,
  TattooAnalysisService,
} from "../services/tattooAnalysis.service";
import {
  Calibration,
  MaterialLine,
  PricingService,
} from "../services/pricing.service";
import { getClientHourlyRate } from "../config/pricing.config";
import {
  createEstimateToken,
  EstimateTokenPayload,
  verifyEstimateToken,
} from "../utils/estimateToken";
import { AI_RATE_LIMIT_MESSAGE, consumeAiQuota } from "../utils/aiRateLimit";
import {
  aiAnalysisRequestSchema,
  aiRepriceRequestSchema,
  clientEstimateRequestSchema,
  clientRepriceRequestSchema,
  TattooCategory,
} from "../validation/aiAnalysis.schema";

const ARTIST_ACCOUNT_TYPES = ["artist", "bussiness"];

type InventoryDoc = Awaited<
  ReturnType<typeof InventoryService.getByAccount>
>[number];

function sendError(response: Response, error: unknown, context: string) {
  if (error instanceof AiAnalysisError) {
    response.status(error.status).json({ error: error.message });
    return;
  }
  console.error(`${context} failed:`, error);
  response.status(500).json({
    error:
      "Something went wrong while estimating this tattoo. Please try again.",
  });
}

function requireArtist(request: AuthRequest, response: Response) {
  if (
    !request.account ||
    !ARTIST_ACCOUNT_TYPES.includes(request.account.type)
  ) {
    response
      .status(403)
      .json({ error: "Only artists can use the AI Tattoo Analysis." });
    return false;
  }
  return true;
}

function buildArtistEstimate(params: {
  category: TattooCategory;
  complexity: number;
  isColored: boolean;
  bodyPart: string;
  widthCm: number;
  heightCm: number;
  hourlyRate: number;
  calibration: Calibration;
  baseMaterials: { inventoryItemId: string; quantity: number }[];
  inventory: InventoryDoc[];
}) {
  const inventoryById = new Map(
    params.inventory.map((item) => [item._id.toString(), item]),
  );

  const work = PricingService.estimateWork({
    widthCm: params.widthCm,
    heightCm: params.heightCm,
    complexity: params.complexity,
    isColored: params.isColored,
    bodyPart: params.bodyPart,
    calibration: params.calibration,
  });

  const materials: MaterialLine[] = [];
  const missingMaterialIds: string[] = [];
  const seen = new Set<string>();
  for (const base of params.baseMaterials) {
    if (seen.has(base.inventoryItemId)) continue;
    seen.add(base.inventoryItemId);
    const item = inventoryById.get(base.inventoryItemId);
    if (!item) {
      missingMaterialIds.push(base.inventoryItemId);
      continue;
    }
    materials.push(
      PricingService.materialLine({
        inventoryItemId: base.inventoryItemId,
        name: item.item,
        category: item.category,
        unit: item.type,
        unitCost: item.price,
        estimatedQuantity: PricingService.scaleMaterialQuantity({
          baseQuantity: base.quantity,
          category: item.category,
          work,
          calibration: params.calibration,
        }),
      }),
    );
  }

  const pricing = PricingService.artistPricing({
    estimatedHours: work.estimatedHours,
    hourlyRate: params.hourlyRate,
    complexity: params.complexity,
    materials,
  });

  return {
    analysis: {
      category: params.category,
      complexity: params.complexity,
      isColored: params.isColored,
      bodyPart: params.bodyPart,
      estimatedHours: work.estimatedHours,
      estimatedSessions: work.estimatedSessions,
    },
    size: {
      widthCm: params.widthCm,
      heightCm: params.heightCm,
      areaCm2: work.areaCm2,
    },
    calibration: params.calibration,
    baseMaterials: params.baseMaterials,
    materials,
    missingMaterialIds,
    pricing,
  };
}

export class AiAnalysisController {
  static analyzeTattoo = async (request: AuthRequest, response: Response) => {
    if (!requireArtist(request, response)) return;
    if (!request.file) {
      response
        .status(400)
        .json({ error: "Please upload a tattoo image first" });
      return;
    }

    const parsed = aiAnalysisRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid request",
      });
      return;
    }
    const { bodyPart, hourlyRate, sizeWidthCm, sizeHeightCm } = parsed.data;
    if (!consumeAiQuota(request.account!._id)) {
      response.status(429).json({ error: AI_RATE_LIMIT_MESSAGE });
      return;
    }

    try {
      const inventory = await InventoryService.getByAccount(
        request.account!._id,
      );

      const ai = await TattooAnalysisService.analyze({
        image: { data: request.file.buffer, mimeType: request.file.mimetype },
        trusted: { bodyPart, widthCm: sizeWidthCm, heightCm: sizeHeightCm },
        inventory: inventory.map((item) => ({
          id: item._id.toString(),
          name: item.item,
          category: item.category,
          unit: item.type,
        })),
      });

      const calibration = PricingService.buildCalibration({
        aiHours: ai.estimatedHours,
        aiSessions: ai.estimatedSessions,
        work: {
          widthCm: sizeWidthCm,
          heightCm: sizeHeightCm,
          complexity: ai.complexity,
          isColored: ai.isColored,
          bodyPart,
        },
      });

      response.json(
        buildArtistEstimate({
          category: ai.category,
          complexity: ai.complexity,
          isColored: ai.isColored,
          bodyPart,
          widthCm: sizeWidthCm,
          heightCm: sizeHeightCm,
          hourlyRate,
          calibration,
          baseMaterials: ai.items.map((i) => ({
            inventoryItemId: i.inventoryItemId,
            quantity: Math.max(1, Math.round(i.estimatedQuantity)),
          })),
          inventory,
        }),
      );
    } catch (error) {
      sendError(response, error, "AI tattoo analysis");
    }
  };

  static repriceTattoo = async (request: AuthRequest, response: Response) => {
    if (!requireArtist(request, response)) return;

    const parsed = aiRepriceRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid request",
      });
      return;
    }
    const body = parsed.data;

    try {
      const inventory = await InventoryService.getByAccount(
        request.account!._id,
      );
      response.json(
        buildArtistEstimate({
          category: body.category,
          complexity: body.complexity,
          isColored: body.isColored,
          bodyPart: body.bodyPart,
          widthCm: body.sizeWidthCm,
          heightCm: body.sizeHeightCm,
          hourlyRate: body.hourlyRate,
          calibration: PricingService.sanitizeCalibration(body.calibration),
          baseMaterials: body.materials,
          inventory,
        }),
      );
    } catch (error) {
      sendError(response, error, "AI tattoo reprice");
    }
  };

  static estimateForClient = async (
    request: AuthRequest,
    response: Response,
  ) => {
    if (!request.file) {
      response
        .status(400)
        .json({ error: "Please upload a tattoo image first" });
      return;
    }

    const parsed = clientEstimateRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid request",
      });
      return;
    }
    const { bodyPart, sizeWidthCm, sizeHeightCm } = parsed.data;

    const hourlyRate = getClientHourlyRate();
    if (!hourlyRate) {
      console.error("Invalid CLIENT_ESTIMATE_HOURLY_RATE configuration");
      response.status(503).json({ error: PRICING_UNAVAILABLE_MESSAGE });
      return;
    }
    if (!consumeAiQuota(request.account?._id ?? request.ip ?? "anonymous")) {
      response.status(429).json({ error: AI_RATE_LIMIT_MESSAGE });
      return;
    }

    try {
      const ai = await TattooAnalysisService.analyze({
        image: { data: request.file.buffer, mimeType: request.file.mimetype },
        trusted: { bodyPart, widthCm: sizeWidthCm, heightCm: sizeHeightCm },
      });

      if (!ai.isTattooDesign) {
        response.status(422).json({
          error:
            "This image doesn't look like a tattoo design. Please upload a clear photo of a tattoo or design.",
        });
        return;
      }

      const sizeSource = sizeWidthCm !== undefined ? "client" : "ai";
      const widthCm = sizeWidthCm ?? ai.estimatedWidthCm;
      const heightCm = sizeHeightCm ?? ai.estimatedHeightCm;
      if (widthCm === undefined || heightCm === undefined) {
        throw new AiAnalysisError(
          502,
          "The AI couldn't estimate a size. Please enter the width and height and try again.",
        );
      }
      const roundedWidth = Math.round(widthCm * 2) / 2 || 0.5;
      const roundedHeight = Math.round(heightCm * 2) / 2 || 0.5;

      const calibration = PricingService.buildCalibration({
        aiHours: ai.estimatedHours,
        aiSessions: ai.estimatedSessions,
        work: {
          widthCm: roundedWidth,
          heightCm: roundedHeight,
          complexity: ai.complexity,
          isColored: ai.isColored,
          bodyPart,
        },
      });

      response.json(
        buildClientEstimate({
          analysis: {
            style: ai.category,
            complexity: ai.complexity,
            isColored: ai.isColored,
            calibration,
          },
          bodyPart,
          widthCm: roundedWidth,
          heightCm: roundedHeight,
          sizeSource,
          hourlyRate,
        }),
      );
    } catch (error) {
      sendError(response, error, "Client AI estimate");
    }
  };

  static repriceForClient = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const parsed = clientRepriceRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: parsed.error.issues[0]?.message || "Invalid request",
      });
      return;
    }
    const { estimateToken, bodyPart, sizeWidthCm, sizeHeightCm } = parsed.data;

    const analysis = verifyEstimateToken(estimateToken);
    if (!analysis) {
      response.status(410).json({
        error: "This estimate has expired. Please analyze the tattoo again.",
      });
      return;
    }

    const hourlyRate = getClientHourlyRate();
    if (!hourlyRate) {
      console.error("Invalid CLIENT_ESTIMATE_HOURLY_RATE configuration");
      response.status(503).json({ error: PRICING_UNAVAILABLE_MESSAGE });
      return;
    }

    try {
      response.json(
        buildClientEstimate({
          analysis: {
            ...analysis,
            calibration: PricingService.sanitizeCalibration(
              analysis.calibration,
            ),
          },
          bodyPart,
          widthCm: sizeWidthCm,
          heightCm: sizeHeightCm,
          sizeSource: "client",
          hourlyRate,
        }),
      );
    } catch (error) {
      sendError(response, error, "Client AI reprice");
    }
  };
}

const PRICING_UNAVAILABLE_MESSAGE =
  "Price estimates are temporarily unavailable. Please try again later.";

function buildClientEstimate(params: {
  analysis: EstimateTokenPayload;
  bodyPart: string;
  widthCm: number;
  heightCm: number;
  sizeSource: "client" | "ai";
  hourlyRate: number;
}) {
  const { analysis, bodyPart, widthCm, heightCm, sizeSource, hourlyRate } =
    params;

  const work = PricingService.estimateWork({
    widthCm,
    heightCm,
    complexity: analysis.complexity,
    isColored: analysis.isColored,
    bodyPart,
    calibration: analysis.calibration,
  });
  const range = PricingService.clientRange({
    work,
    calibration: analysis.calibration,
    complexity: analysis.complexity,
    isColored: analysis.isColored,
    sizeSource,
    hourlyRate,
  });

  return {
    style: analysis.style,
    complexity: analysis.complexity,
    isColored: analysis.isColored,
    bodyPart,
    size: { widthCm, heightCm, source: sizeSource },
    hours: range.hours,
    sessions: range.sessions,
    price: { ...range.price, currency: "PHP" },
    estimateToken: createEstimateToken(analysis),
  };
}
