import { z } from "zod";

export const TATTOO_CATEGORIES = [
  "Traditional",
  "Minimalist",
  "Fine Line",
  "Tribal",
  "Blackwork",
  "Illustrative",
  "Anime",
  "Dotwork",
  "Geometric",
  "Japanese",
  "Realism",
  "Portrait",
] as const;

export type TattooCategory = (typeof TATTOO_CATEGORIES)[number];

export const MODEL_BODY_PARTS = [
  "Arm",
  "Calves",
  "Stomach",
  "Legs",
  "Hand",
  "Chest",
  "Back",
  "Head",
] as const;

export const MAX_SIZE_CM = 100;

const sizeCm = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `Please enter the tattoo ${label} first` })
    .positive(`Tattoo ${label} must be greater than 0`)
    .max(MAX_SIZE_CM, `Tattoo ${label} looks too large, please double-check`);

const bodyPartField = z
  .string({ required_error: "Please select a body part first" })
  .trim()
  .min(1, "Please select a body part first")
  .max(40);

const hourlyRateField = z.coerce
  .number({ invalid_type_error: "Please enter your hourly rate first" })
  .positive("Hourly rate must be greater than 0")
  .max(1_000_000, "Hourly rate looks too large, please double-check");

const optionalHourlyRate = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? undefined : v),
  hourlyRateField.optional(),
);

export const aiAnalysisRequestSchema = z.object({
  bodyPart: bodyPartField,
  hourlyRate: optionalHourlyRate,
  sizeWidthCm: sizeCm("width"),
  sizeHeightCm: sizeCm("height"),
});

export type AiAnalysisRequest = z.infer<typeof aiAnalysisRequestSchema>;

export const calibrationSchema = z.object({
  timeFactor: z.number().positive().max(10),
  hoursPerSession: z.number().positive().max(24),
  refAreaCm2: z
    .number()
    .positive()
    .max(MAX_SIZE_CM * MAX_SIZE_CM),
  refSessions: z.number().int().min(1).max(100),
});

export const aiRepriceRequestSchema = z.object({
  category: z.enum(TATTOO_CATEGORIES),
  complexity: z.number().int().min(1).max(5),
  isColored: z.boolean(),
  bodyPart: bodyPartField,
  hourlyRate: optionalHourlyRate,
  sizeWidthCm: sizeCm("width"),
  sizeHeightCm: sizeCm("height"),
  calibration: calibrationSchema,
  materials: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1).max(64),
        quantity: z.number().positive().max(10_000),
      }),
    )
    .max(30)
    .default([]),
});

export type AiRepriceRequest = z.infer<typeof aiRepriceRequestSchema>;

const optionalSize = (label: string) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    sizeCm(label).optional(),
  );

const modelBodyPartField = z.enum(MODEL_BODY_PARTS, {
  errorMap: () => ({
    message: "Please select where the tattoo goes on the 3D body",
  }),
});

export const clientEstimateRequestSchema = z
  .object({
    bodyPart: modelBodyPartField,
    sizeWidthCm: optionalSize("width"),
    sizeHeightCm: optionalSize("height"),
  })
  .refine(
    (v) => (v.sizeWidthCm === undefined) === (v.sizeHeightCm === undefined),
    { message: "Please enter both width and height, or leave both empty" },
  );

export const clientRepriceRequestSchema = z.object({
  estimateToken: z.string().min(1).max(2000),
  bodyPart: modelBodyPartField,
  sizeWidthCm: sizeCm("width"),
  sizeHeightCm: sizeCm("height"),
});

export type ClientEstimateRequest = z.infer<typeof clientEstimateRequestSchema>;

export const geminiAnalysisSchema = z.object({
  isTattooDesign: z.boolean(),
  category: z.enum(TATTOO_CATEGORIES),
  complexity: z.number().int().min(1).max(5),
  isColored: z.boolean(),
  estimatedWidthCm: z.number().positive().max(MAX_SIZE_CM).optional(),
  estimatedHeightCm: z.number().positive().max(MAX_SIZE_CM).optional(),
  estimatedHours: z.number().positive().max(100),
  estimatedSessions: z.number().positive().max(100),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        estimatedQuantity: z.number().positive(),
      }),
    )
    .max(30)
    .default([]),
});

export type GeminiAnalysis = z.infer<typeof geminiAnalysisSchema>;

export const aiEstimateSnapshotSchema = z.object({
  category: z.string().min(1).max(40),
  complexity: z.number().int().min(1).max(5),
  isColored: z.boolean(),
  bodyPart: z.string().min(1).max(40),
  sizeWidthCm: z.number().positive().max(MAX_SIZE_CM),
  sizeHeightCm: z.number().positive().max(MAX_SIZE_CM),
  hourlyRate: z.number().nonnegative(),
  estimatedHours: z.number().nonnegative(),
  estimatedSessions: z.number().int().min(1),
  materials: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        name: z.string().min(1),
        estimatedQuantity: z.number().nonnegative(),
        unitCost: z.number().nonnegative(),
        estimatedCost: z.number().nonnegative(),
      }),
    )
    .max(30),
  laborCost: z.number().nonnegative(),
  materialCost: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
  suggestedPrice: z.number().nonnegative(),
  estimatedProfit: z.number(),
  generatedAt: z.coerce.date(),
});
