export const PRICING_CONFIG = {
  SETUP_HOURS: 0.5,

  MINUTES_PER_CM2_BY_COMPLEXITY: {
    1: 0.35,
    2: 0.6,
    3: 0.9,
    4: 1.3,
    5: 1.8,
  } as Record<number, number>,

  COLOR_TIME_FACTOR: 1.25,

  BODY_PART_TIME_FACTOR: {
    Arm: 1.0,
    Forearm: 1.0,
    "Upper Arm": 1.0,
    Shoulder: 1.05,
    Chest: 1.1,
    Stomach: 1.15,
    Back: 1.0,
    Legs: 1.0,
    Thigh: 1.0,
    Calves: 1.05,
    Calf: 1.05,
    Hand: 1.3,
    Wrist: 1.15,
    Neck: 1.25,
    Head: 1.35,
    Rib: 1.3,
    Foot: 1.3,
    Other: 1.0,
  } as Record<string, number>,

  AI_TIME_FACTOR_MIN: 0.6,
  AI_TIME_FACTOR_MAX: 1.6,

  DEFAULT_HOURS_PER_SESSION: 4,
  MIN_HOURS_PER_SESSION: 2,
  MAX_HOURS_PER_SESSION: 6,

  MIN_ESTIMATED_HOURS: 0.5,
  MAX_ESTIMATED_HOURS: 60,
  MIN_ESTIMATED_SESSIONS: 1,
  MAX_ESTIMATED_SESSIONS: 15,

  SHOP_MARGIN_PERCENT: 30,

  COMPLEXITY_SURCHARGE_PERCENT: { 1: 0, 2: 3, 3: 6, 4: 10, 5: 15 } as Record<
    number,
    number
  >,

  MATERIAL_SCALING_BY_CATEGORY: {
    "INKS & PIGMENTS": "area",
    "NEEDLES & CARTRIDGES": "sessions",
    "TATTOO EQUIPMENT": "fixed",
    "INK & DISPOSABLE SUPPLIES": "sessions",
    PPE: "sessions",
    "SKIN PREPARATION": "sessions",
    "STENCIL SUPPLIES": "sessions",
    "BARRIERS & PROTECTION": "sessions",
    "CLEANING & SANITIZATION": "sessions",
    "WASTE DISPOSAL": "sessions",
    AFTERCARE: "fixed",
    "STUDIO / GENERAL SUPPLIES": "sessions",
    "Inks & Pigments": "area",
    "Needles & Cartridges": "sessions",
    "Hygiene & Safety": "sessions",
    "kin Prep & Aftercare": "sessions",
    "Skin Prep & Aftercare": "sessions",
    "Tattoo Equipment": "fixed",
  } as Record<string, "area" | "sessions" | "fixed">,

  AREA_MATERIAL_SCALING_EXPONENT: 0.5,

  CLIENT_TYPICAL_HOURLY_RATE: 1500,

  CLIENT_MATERIAL_COST_PER_SESSION: 300,
  CLIENT_INK_COST_PER_CM2: { black: 1, color: 2 },

  CLIENT_HOURS_UNCERTAINTY: { providedSize: 0.15, aiSize: 0.25 },

  CLIENT_PRICE_ROUNDING: { small: 100, large: 500, threshold: 5000 },
};

export type MaterialScaling = "area" | "sessions" | "fixed";

function envNumber(name: string): number | undefined {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

export function getClientHourlyRate(): number | null {
  const override = envNumber("CLIENT_ESTIMATE_HOURLY_RATE");
  const rate = override ?? PRICING_CONFIG.CLIENT_TYPICAL_HOURLY_RATE;
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}
