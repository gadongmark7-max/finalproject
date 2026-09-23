import { PRICING_CONFIG, MaterialScaling } from "../config/pricing.config";

export interface WorkInput {
  widthCm: number;
  heightCm: number;
  complexity: number;
  isColored: boolean;
  bodyPart?: string | null;
  calibration?: Calibration | null;
}

export interface Calibration {
  timeFactor: number;
  hoursPerSession: number;
  refAreaCm2: number;
  refSessions: number;
}

export interface WorkEstimate {
  areaCm2: number;
  estimatedHours: number;
  estimatedSessions: number;
}

export interface MaterialLine {
  inventoryItemId: string;
  name: string;
  category: string;
  unit: string;
  estimatedQuantity: number;
  unitCost: number;
  estimatedCost: number;
}

export interface ArtistPricing {
  hourlyRate: number;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  complexitySurchargePercent: number;
  marginPercent: number;
  suggestedPrice: number;
  estimatedProfit: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const roundQuarter = (n: number) => Math.round(n * 4) / 4;
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export class PricingService {
  static areaCm2(widthCm: number, heightCm: number) {
    return round2(widthCm * heightCm);
  }

  static bodyPartFactor(bodyPart?: string | null) {
    if (!bodyPart) return 1;
    return PRICING_CONFIG.BODY_PART_TIME_FACTOR[bodyPart] ?? 1;
  }

  static modelHours(input: Omit<WorkInput, "calibration">) {
    const minutesPerCm2 =
      PRICING_CONFIG.MINUTES_PER_CM2_BY_COMPLEXITY[input.complexity] ??
      PRICING_CONFIG.MINUTES_PER_CM2_BY_COMPLEXITY[3];
    const colorFactor = input.isColored ? PRICING_CONFIG.COLOR_TIME_FACTOR : 1;
    const area = PricingService.areaCm2(input.widthCm, input.heightCm);

    return (
      PRICING_CONFIG.SETUP_HOURS +
      ((area * minutesPerCm2) / 60) *
        colorFactor *
        PricingService.bodyPartFactor(input.bodyPart)
    );
  }

  static buildCalibration(params: {
    aiHours: number;
    aiSessions: number;
    work: Omit<WorkInput, "calibration">;
  }): Calibration {
    const { aiHours, aiSessions, work } = params;
    const base = PricingService.modelHours(work);
    const timeFactor = round2(
      clamp(
        aiHours / base,
        PRICING_CONFIG.AI_TIME_FACTOR_MIN,
        PRICING_CONFIG.AI_TIME_FACTOR_MAX,
      ),
    );
    const hoursPerSession =
      aiSessions > 1
        ? round2(
            clamp(
              aiHours / aiSessions,
              PRICING_CONFIG.MIN_HOURS_PER_SESSION,
              PRICING_CONFIG.MAX_HOURS_PER_SESSION,
            ),
          )
        : Math.max(
            PRICING_CONFIG.DEFAULT_HOURS_PER_SESSION,
            Math.min(aiHours, PRICING_CONFIG.MAX_HOURS_PER_SESSION),
          );
    const estimate = PricingService.estimateWork({
      ...work,
      calibration: {
        timeFactor,
        hoursPerSession,
        refAreaCm2: 0,
        refSessions: 1,
      },
    });
    return {
      timeFactor,
      hoursPerSession,
      refAreaCm2: estimate.areaCm2,
      refSessions: estimate.estimatedSessions,
    };
  }

  static sanitizeCalibration(c: Calibration): Calibration {
    return {
      timeFactor: clamp(
        c.timeFactor,
        PRICING_CONFIG.AI_TIME_FACTOR_MIN,
        PRICING_CONFIG.AI_TIME_FACTOR_MAX,
      ),
      hoursPerSession: clamp(
        c.hoursPerSession,
        PRICING_CONFIG.MIN_HOURS_PER_SESSION,
        PRICING_CONFIG.MAX_HOURS_PER_SESSION,
      ),
      refAreaCm2: Math.max(0.01, c.refAreaCm2),
      refSessions: Math.max(1, Math.round(c.refSessions)),
    };
  }

  static sessionsForHours(hours: number, hoursPerSession: number) {
    return clamp(
      Math.ceil(hours / hoursPerSession),
      PRICING_CONFIG.MIN_ESTIMATED_SESSIONS,
      PRICING_CONFIG.MAX_ESTIMATED_SESSIONS,
    );
  }

  static estimateWork(input: WorkInput): WorkEstimate {
    const timeFactor = input.calibration?.timeFactor ?? 1;
    const hoursPerSession =
      input.calibration?.hoursPerSession ??
      PRICING_CONFIG.DEFAULT_HOURS_PER_SESSION;

    const estimatedHours = clamp(
      roundQuarter(PricingService.modelHours(input) * timeFactor),
      PRICING_CONFIG.MIN_ESTIMATED_HOURS,
      PRICING_CONFIG.MAX_ESTIMATED_HOURS,
    );

    return {
      areaCm2: PricingService.areaCm2(input.widthCm, input.heightCm),
      estimatedHours,
      estimatedSessions: PricingService.sessionsForHours(
        estimatedHours,
        hoursPerSession,
      ),
    };
  }

  static scaleMaterialQuantity(params: {
    baseQuantity: number;
    category: string;
    work: WorkEstimate;
    calibration: Calibration;
  }) {
    const { baseQuantity, category, work, calibration } = params;
    const scaling: MaterialScaling =
      PRICING_CONFIG.MATERIAL_SCALING_BY_CATEGORY[category] ?? "sessions";

    let ratio = 1;
    if (scaling === "area")
      ratio =
        Math.max(1, work.areaCm2 / calibration.refAreaCm2) **
        PRICING_CONFIG.AREA_MATERIAL_SCALING_EXPONENT;
    if (scaling === "sessions")
      ratio = work.estimatedSessions / calibration.refSessions;

    return Math.max(1, Math.ceil(baseQuantity * ratio - 1e-9));
  }

  static materialLine(item: Omit<MaterialLine, "estimatedCost">): MaterialLine {
    return {
      ...item,
      estimatedCost: round2(item.estimatedQuantity * item.unitCost),
    };
  }

  static artistPricing(params: {
    estimatedHours: number;
    hourlyRate: number;
    complexity: number;
    materials: MaterialLine[];
  }): ArtistPricing {
    const { estimatedHours, hourlyRate, complexity, materials } = params;

    const laborCost = round2(estimatedHours * hourlyRate);
    const materialCost = round2(
      materials.reduce((sum, m) => sum + m.estimatedCost, 0),
    );
    const totalCost = round2(laborCost + materialCost);
    const complexitySurchargePercent =
      PRICING_CONFIG.COMPLEXITY_SURCHARGE_PERCENT[complexity] ?? 0;
    const marginPercent = PRICING_CONFIG.SHOP_MARGIN_PERCENT;

    const suggestedPrice = round2(
      totalCost *
        (1 + complexitySurchargePercent / 100) *
        (1 + marginPercent / 100),
    );

    return {
      hourlyRate,
      laborCost,
      materialCost,
      totalCost,
      complexitySurchargePercent,
      marginPercent,
      suggestedPrice,
      estimatedProfit: round2(suggestedPrice - totalCost),
    };
  }

  static clientRange(params: {
    work: WorkEstimate;
    calibration: Calibration;
    complexity: number;
    isColored: boolean;
    sizeSource: "client" | "ai";
    hourlyRate: number;
  }) {
    const { work, calibration, complexity, isColored, sizeSource, hourlyRate } =
      params;
    const uncertainty =
      sizeSource === "client"
        ? PRICING_CONFIG.CLIENT_HOURS_UNCERTAINTY.providedSize
        : PRICING_CONFIG.CLIENT_HOURS_UNCERTAINTY.aiSize;

    const hoursLow = clamp(
      roundQuarter(work.estimatedHours * (1 - uncertainty)),
      PRICING_CONFIG.MIN_ESTIMATED_HOURS,
      PRICING_CONFIG.MAX_ESTIMATED_HOURS,
    );
    const hoursHigh = clamp(
      roundQuarter(work.estimatedHours * (1 + uncertainty)),
      PRICING_CONFIG.MIN_ESTIMATED_HOURS,
      PRICING_CONFIG.MAX_ESTIMATED_HOURS,
    );
    const sessionsLow = PricingService.sessionsForHours(
      hoursLow,
      calibration.hoursPerSession,
    );
    const sessionsHigh = PricingService.sessionsForHours(
      hoursHigh,
      calibration.hoursPerSession,
    );

    const inkPerCm2 = isColored
      ? PRICING_CONFIG.CLIENT_INK_COST_PER_CM2.color
      : PRICING_CONFIG.CLIENT_INK_COST_PER_CM2.black;
    const materialCost = (sessions: number) =>
      work.areaCm2 * inkPerCm2 +
      sessions * PRICING_CONFIG.CLIENT_MATERIAL_COST_PER_SESSION;

    const priceFor = (hours: number, rate: number, sessions: number) =>
      PricingService.artistPricing({
        estimatedHours: hours,
        hourlyRate: rate,
        complexity,
        materials: [
          {
            inventoryItemId: "generic",
            name: "generic",
            category: "generic",
            unit: "generic",
            estimatedQuantity: 1,
            unitCost: materialCost(sessions),
            estimatedCost: round2(materialCost(sessions)),
          },
        ],
      }).suggestedPrice;

    const rounding = PRICING_CONFIG.CLIENT_PRICE_ROUNDING;
    const stepFor = (n: number) =>
      n < rounding.threshold ? rounding.small : rounding.large;
    const rawMin = priceFor(hoursLow, hourlyRate, sessionsLow);
    const rawMax = priceFor(hoursHigh, hourlyRate, sessionsHigh);
    const min = Math.max(
      rounding.small,
      Math.floor(rawMin / stepFor(rawMin)) * stepFor(rawMin),
    );
    const max = Math.max(
      min + stepFor(min),
      Math.ceil(rawMax / stepFor(rawMax)) * stepFor(rawMax),
    );

    return {
      hours: { min: hoursLow, max: hoursHigh },
      sessions: { min: sessionsLow, max: sessionsHigh },
      price: { min, max },
    };
  }
}
