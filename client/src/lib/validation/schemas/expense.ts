import { z } from "zod"

import {
  moneyField,
  optionalText,
  requiredText,
  selectField,
} from "@/lib/validation/fields"

export const expenseSchema = z.object({
  category: selectField("a category"),
  description: requiredText("Description", { min: 2, max: 140 }),
  cost: moneyField({ label: "Amount" }),
  date: z
    .string({ required_error: "Date is required" })
    .trim()
    .min(1, "Date is required")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), "Please choose a valid date"),
  notes: optionalText({ max: 500 }),
})
export type ExpenseValues = z.infer<typeof expenseSchema>
