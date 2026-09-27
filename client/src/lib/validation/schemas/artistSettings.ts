import { moneyField } from "@/lib/validation/fields";

export const hourlyRateSchema = moneyField({
  label: "Hourly rate",
  allowZero: true,
  max: 1_000_000,
});
