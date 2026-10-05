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
import { isMeasuredInkItem, ML_PER_UNIT } from "../model/inventory.model";
import {
  createEstimateToken,
  EstimateTokenPayload,
  verifyEstimateToken,
} from "../utils/estimateToken";
import { AI_RATE_LIMIT_MESSAGE, consumeAiQuota } from "../utils/aiRateLimit";
import { ArtistInfoService } from "../services/artistInfo.service";
import {
  AiEstimatorUsageService,
  EstimatorUsageStatus,
  ESTIMATOR_ATTEMPT_LIMIT,
  formatCooldown,
} from "../services/aiEstimatorUsage.service";
import {
  aiAnalysisRequestSchema,
  aiRepriceRequestSchema,
  clientEstimateRequestSchema,
  clientRepriceRequestSchema,
  InkSelection,
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

const HOURLY_RATE_NOT_SET_MESSAGE =
  "Set your hourly rate in Settings before running the AI Tattoo Analysis.";

/**
 * Artists always price with the hourly rate saved in their Settings, so a
 * post/booking form can't override it. Other accounts (business) keep
 * sending the rate with the request.
 */
async function resolveHourlyRate(
  request: AuthRequest,
  requested: number | undefined,
): Promise<number | null> {
  if (request.account!.type === "artist") {
    const rate = await ArtistInfoService.getHourlyRate(request.account!._id);
    return typeof rate === "number" ? rate : null;
  }
  return requested ?? null;
}

function inkOptionsFor(inventory: InventoryDoc[]) {
  return inventory
    .filter(isMeasuredInkItem)
    .map((item) => {
      const mlPerUnit = ML_PER_UNIT[item.type];
      return {
        inventoryItemId: item._id.toString(),
        name: item.item,
        unit: item.type,
        quantityPerItem: item.quantityPerItem ?? null,
        pricePerMl: PricingService.pricePerMl(item.price, mlPerUnit),
        availableMl: item.stocks * mlPerUnit,
        selectable: true,
      };
    });
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function uniqueInkSelections(selections: InkSelection[]) {
  const seen = new Set<string>();
  return selections.filter((s) => {
    if (seen.has(s.inventoryItemId)) return false;
    seen.add(s.inventoryItemId);
    return true;
  });
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
  ink: { baseMl: number; selections: InkSelection[] | null } | null;
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
    if (isMeasuredInkItem(item)) continue;
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

  const inkOptions = inkOptionsFor(params.inventory);
  const selectableInks = inkOptions.filter((o) => o.selectable);
  let ink = null;
  let inkCost = 0;
  if (params.ink) {
    const estimatedMl = PricingService.scaleInkMl({
      baseMl: params.ink.baseMl,
      work,
      calibration: params.calibration,
    });
    const requested = params.ink.selections;
    for (const sel of requested ?? []) {
      if (!inventoryById.has(sel.inventoryItemId))
        missingMaterialIds.push(sel.inventoryItemId);
    }
    const chosen = requested
      ? uniqueInkSelections(requested).filter((sel) =>
          selectableInks.some((o) => o.inventoryItemId === sel.inventoryItemId),
        )
      : selectableInks.length === 1
        ? [{ inventoryItemId: selectableInks[0].inventoryItemId, share: 100 }]
        : [];
    const totalShare = chosen.reduce((sum, sel) => sum + sel.share, 0);

    const selections = chosen.map((sel) => {
      const option = selectableInks.find(
        (o) => o.inventoryItemId === sel.inventoryItemId,
      )!;
      const item = inventoryById.get(sel.inventoryItemId)!;
      const fraction = sel.share / totalShare;
      const ml = round2(estimatedMl * fraction);
      const line = PricingService.materialLine({
        inventoryItemId: sel.inventoryItemId,
        name: item.item,
        category: item.category,
        unit: item.type,
        unitCost: item.price,
        estimatedQuantity: PricingService.inkQuantityInUnit(
          ml,
          ML_PER_UNIT[item.type],
        ),
      });
      return {
        line,
        selection: {
          inventoryItemId: sel.inventoryItemId,
          name: item.item,
          share: Math.round(fraction * 1000) / 10,
          ml,
          quantityInUnit: line.estimatedQuantity,
          unit: line.unit,
          pricePerMl: option.pricePerMl,
          cost: line.estimatedCost,
        },
      };
    });

    materials.unshift(...selections.map((s) => s.line));
    inkCost = round2(selections.reduce((sum, s) => sum + s.line.estimatedCost, 0));

    ink = {
      baseMl: params.ink.baseMl,
      estimatedMl,
      selections: selections.map((s) => s.selection),
      cost: inkCost,
      needsSelection: selections.length === 0 && selectableInks.length > 0,
      options: inkOptions,
    };
  }

  const pricing = PricingService.artistPricing({
    estimatedHours: work.estimatedHours,
    hourlyRate: params.hourlyRate,
    complexity: params.complexity,
    materials,
    inkCost,
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
    ink,
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
    const { bodyPart, sizeWidthCm, sizeHeightCm, inkSelections } =
      parsed.data;
    const hourlyRate = await resolveHourlyRate(request, parsed.data.hourlyRate);
    if (hourlyRate === null) {
      response.status(400).json({ error: HOURLY_RATE_NOT_SET_MESSAGE });
      return;
    }
    if (!consumeAiQuota(request.account!._id)) {
      response.status(429).json({ error: AI_RATE_LIMIT_MESSAGE });
      return;
    }

    try {
      const inventory = await InventoryService.getByAccount(
        request.account!._id,
      );
      const toOption = (item: InventoryDoc) => ({
        id: item._id.toString(),
        name: item.item,
        category: item.category,
        unit: item.type,
      });
      const inks = inventory.filter(isMeasuredInkItem).map(toOption);

      const ai = await TattooAnalysisService.analyze({
        image: { data: request.file.buffer, mimeType: request.file.mimetype },
        trusted: { bodyPart, widthCm: sizeWidthCm, heightCm: sizeHeightCm },
        inventory: inventory
          .filter((item) => !isMeasuredInkItem(item))
          .map(toOption),
        inks,
      });

      const aiInkSelections = uniqueInkSelections(
        ai.inkUsage
          .filter((usage) => inks.some((ink) => ink.id === usage.inkItemId))
          .map((usage) => ({
            inventoryItemId: usage.inkItemId,
            share: usage.percent,
          })),
      );
      const detectedBodyPart =
        ai.detectedBodyPart && ai.detectedBodyPart !== "Unknown"
          ? ai.detectedBodyPart
          : null;

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

      response.json({
        ...buildArtistEstimate({
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
          ink:
            ai.estimatedInkMl !== undefined
              ? {
                  baseMl: PricingService.clampInkMl(ai.estimatedInkMl),
                  selections:
                    inkSelections ??
                    (aiInkSelections.length > 0 ? aiInkSelections : null),
                }
              : null,
        }),
        detected: {
          bodyPart: detectedBodyPart,
          inkItemIds: aiInkSelections.map((sel) => sel.inventoryItemId),
        },
      });
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
    const hourlyRate = await resolveHourlyRate(request, body.hourlyRate);
    if (hourlyRate === null) {
      response.status(400).json({ error: HOURLY_RATE_NOT_SET_MESSAGE });
      return;
    }

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
          hourlyRate,
          calibration: PricingService.sanitizeCalibration(body.calibration),
          baseMaterials: body.materials,
          inventory,
          ink: body.ink
            ? {
                baseMl: PricingService.clampInkMl(body.ink.baseMl),
                selections: body.ink.selections,
              }
            : null,
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
    const accountId = request.account?._id;
    if (!accountId) {
      response.status(401).json({ error: "unauthorized" });
      return;
    }

    let usage: EstimatorUsageStatus;
    try {
      const attempt = await AiEstimatorUsageService.consume(accountId);
      usage = attempt.status;
      if (!attempt.allowed) {
        response.status(429).json({
          error: estimatorLimitMessage(usage),
          code: ESTIMATOR_LIMIT_CODE,
          usage,
        });
        return;
      }
    } catch (error) {
      sendError(response, error, "Client AI estimate usage");
      return;
    }

    if (!consumeAiQuota(accountId)) {
      usage = await AiEstimatorUsageService.release(accountId);
      response.status(429).json({ error: AI_RATE_LIMIT_MESSAGE, usage });
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
          usage,
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

      response.json({
        ...buildClientEstimate({
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
        usage,
      });
    } catch (error) {
      if (shouldReleaseAttempt(error)) {
        try {
          usage = await AiEstimatorUsageService.release(accountId);
        } catch (releaseError) {
          console.error("Releasing estimator attempt failed:", releaseError);
        }
      }
      if (error instanceof AiAnalysisError) {
        response.status(error.status).json({ error: error.message, usage });
        return;
      }
      sendError(response, error, "Client AI estimate");
    }
  };

  static getEstimatorUsage = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const accountId = request.account?._id;
    if (!accountId) {
      response.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      response.json(await AiEstimatorUsageService.getStatus(accountId));
    } catch (error) {
      sendError(response, error, "Client AI estimate usage");
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

const ESTIMATOR_LIMIT_CODE = "ESTIMATOR_LIMIT_REACHED";

function estimatorLimitMessage(usage: EstimatorUsageStatus) {
  const wait = usage.cooldownRemainingMs
    ? ` You can try again in ${formatCooldown(usage.cooldownRemainingMs)}.`
    : "";
  return `You've used all ${ESTIMATOR_ATTEMPT_LIMIT} AI estimator tests.${wait}`;
}

function shouldReleaseAttempt(error: unknown) {
  if (!(error instanceof AiAnalysisError)) return true;
  return error.status >= 500 || error.status === 429;
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
