import { z } from "zod";

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
