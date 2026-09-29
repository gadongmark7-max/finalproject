import { z } from "zod";
import {
  ACCESS_CODE_MAX_LENGTH,
  ACCESS_CODE_MIN_LENGTH,
} from "../utils/accessCode";

export const MAX_HOURLY_RATE = 1_000_000;

export const hourlyRateField = z.coerce
  .number({
    required_error: "Hourly rate is required",
    invalid_type_error: "Hourly rate must be a number",
  })
  .finite("Hourly rate must be a number")
  .nonnegative("Hourly rate cannot be negative")
  .max(MAX_HOURLY_RATE, "Hourly rate looks too large, please double-check")
  .transform((n) => Math.round(n * 100) / 100);

export const updateHourlyRateSchema = z.object({
  hourlyRate: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    hourlyRateField,
  ),
});

export const customAccessCodeSchema = z
  .string({
    required_error: "Access code is required",
    invalid_type_error: "Access code must be text",
  })
  .trim()
  .min(1, "Access code is required")
  .min(
    ACCESS_CODE_MIN_LENGTH,
    `Access code must be at least ${ACCESS_CODE_MIN_LENGTH} characters`,
  )
  .max(
    ACCESS_CODE_MAX_LENGTH,
    `Access code must be at most ${ACCESS_CODE_MAX_LENGTH} characters`,
  )
  .regex(/^\S+$/, "Access code cannot contain spaces");
