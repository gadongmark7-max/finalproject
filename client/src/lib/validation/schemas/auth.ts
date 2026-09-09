import { z } from "zod"

import {
  emailField,
  otpField,
  passwordField,
  passwordsMatch,
  phonePH,
  requiredText,
} from "@/lib/validation/fields"


export const loginSchema = z.object({
  email: emailField(),
  password: z.string().min(1, "Password is required"),
})
export type LoginValues = z.infer<typeof loginSchema>


export const registerSchema = z
  .object({
    name: requiredText("Full name", { min: 2, max: 80 }),
    email: emailField(),
    contact: phonePH(),
    password: passwordField(),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Please accept the Terms and Privacy Policy" }),
    }),
  })
  .refine(passwordsMatch.check, passwordsMatch.error)
export type RegisterValues = z.infer<typeof registerSchema>


export const otpSchema = z.object({
  code: otpField(6),
})
export type OtpValues = z.infer<typeof otpSchema>


export const forgotEmailSchema = z.object({
  email: emailField(),
})
export type ForgotEmailValues = z.infer<typeof forgotEmailSchema>

export const forgotOtpSchema = z.object({
  code: otpField(6),
})
export type ForgotOtpValues = z.infer<typeof forgotOtpSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordField(),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(passwordsMatch.check, passwordsMatch.error)
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
