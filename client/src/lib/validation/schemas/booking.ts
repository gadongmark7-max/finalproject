import { z } from "zod"

import {
  emailField,
  moneyField,
  phonePH,
  requiredText,
} from "@/lib/validation/fields"

export { firstError } from "@/lib/validation/fields"

export const priceField = moneyField({ label: "Price", min: 50 })

export const bookingClientSchema = z.object({
  clientName: requiredText("Client name", { min: 2, max: 80 }),
  clientEmail: emailField(),
  clientContact: phonePH(),
})
export type BookingClientValues = z.infer<typeof bookingClientSchema>
