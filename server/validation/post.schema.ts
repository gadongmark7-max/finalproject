import { z } from "zod";
import { MAX_SIZE_CM } from "./aiAnalysis.schema";

export const MAX_SESSION_HOURS = 24;

export const sessionsField = z
  .array(
    z
      .number({ invalid_type_error: "Session hours must be numbers" })
      .int("Session hours must be whole numbers")
      .min(1, "Each session must be at least 1 hour")
      .max(MAX_SESSION_HOURS, `Each session can be at most ${MAX_SESSION_HOURS} hours`),
  )
  .min(1, "Add at least one session")
  .max(20, "Too many sessions");

const sizeCmField = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `Tattoo ${label} must be a number` })
    .positive(`Tattoo ${label} must be greater than 0`)
    .max(MAX_SIZE_CM, `Tattoo ${label} looks too large, please double-check`)
    .transform((n) => Math.round(n * 100) / 100);

export const updatePostSchema = z
  .object({
    tags: z.array(z.string().trim().min(1).max(40)).min(1).max(5).optional(),
    category: z.string().trim().min(1).max(40).optional(),
    sessions: sessionsField.optional(),
    price: z.coerce.number().finite().nonnegative().optional(),
    downPercentage: z.coerce.number().finite().min(0).max(100).optional(),
    sizeWidthCm: sizeCmField("width").optional(),
    sizeHeightCm: sizeCmField("height").optional(),
  })
  .refine(
    (v) => (v.sizeWidthCm === undefined) === (v.sizeHeightCm === undefined),
    { message: "Please enter both the tattoo width and height" },
  );

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
