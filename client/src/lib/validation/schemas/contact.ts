import { z } from "zod"

import { emailField, longText, requiredText } from "@/lib/validation/fields"

export const consultationSchema = z.object({
  firstName: requiredText("First name", { min: 2, max: 60 }),
  email: emailField(),
  idea: requiredText("Style / idea", { min: 2, max: 120 }),
  details: longText("Message", { min: 10, max: 1000 }),
})
export type ConsultationValues = z.infer<typeof consultationSchema>
