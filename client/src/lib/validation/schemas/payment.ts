import { z } from "zod"

import {
  dateField,
  longText,
  moneyField,
  selectField,
} from "@/lib/validation/fields"

const PAYMENT_METHODS = ["Cash", "Gcash", "Pay maya", "Bank Transfer"] as const


export function makeCashPaymentSchema(balance: number) {
  return z
    .object({
      amount: moneyField({ label: "Amount", max: Math.max(balance, 0) || undefined }),
      customerPayment: moneyField({ label: "Customer payment" }),
      paymentMethod: selectField("a payment method", [""]).refine(
        (v) => (PAYMENT_METHODS as readonly string[]).includes(v),
        "Please select a payment method",
      ),
    })
    .superRefine((val, ctx) => {
      if (Number.isFinite(balance) && val.amount > balance) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: `Amount can't be more than the ₱${balance.toLocaleString()} balance`,
        })
      }
      if (val.customerPayment < val.amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customerPayment"],
          message: "Customer payment can't be less than the amount due",
        })
      }
    })
}
export type CashPaymentValues = z.infer<ReturnType<typeof makeCashPaymentSchema>>

export function makeOnlinePaymentSchema(balance: number) {
  return z.object({
    amount: moneyField({ label: "Amount", min: 20 }).refine(
      (n) => !Number.isFinite(balance) || n <= balance,
      `Amount can't be more than the ₱${balance.toLocaleString()} balance`,
    ),
  })
}
export type OnlinePaymentValues = z.infer<ReturnType<typeof makeOnlinePaymentSchema>>

export const expenseSchema = z.object({
  cost: moneyField({ label: "Cost" }),
  description: longText("Description", { min: 3, max: 300 }),
  date: dateField("Expense date"),
})
export type ExpenseValues = z.infer<typeof expenseSchema>
