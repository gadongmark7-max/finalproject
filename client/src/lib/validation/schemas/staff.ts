import { z } from "zod"

import {
  countField,
  dateStringField,
  emailField,
  optionalDigits,
  passwordField,
  passwordsMatch,
  phonePH,
  requiredText,
  selectField,
} from "@/lib/validation/fields"

export const employeeInfoSchema = z.object({
  fullname: requiredText("Full name", { min: 2, max: 100 }),
  email: emailField(),
  contact: phonePH(),
  dateOfBirth: dateStringField("Date of birth", { past: true }),
  Gender: selectField("a gender"),
  civilStatus: selectField("a civil status"),
  address: requiredText("Address", { min: 3, max: 200 }),
  TIN: optionalDigits("TIN", { min: 9, max: 12 }),
  SSS: optionalDigits("SSS number", { min: 10, max: 10 }),
  PhilHealth: optionalDigits("PhilHealth number", { min: 12, max: 12 }),
  PagIbig: optionalDigits("Pag-IBIG number", { min: 12, max: 12 }),
})
export type EmployeeInfoValues = z.infer<typeof employeeInfoSchema>

export const addEmployeeSchema = z
  .object({
    name: requiredText("Name", { min: 2, max: 80 }),
    email: emailField(),
    contact: phonePH(),
    role: selectField("a role"),
    password: passwordField(),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine(passwordsMatch.check, passwordsMatch.error)
export type AddEmployeeValues = z.infer<typeof addEmployeeSchema>

export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(20, "Job description must be at least 20 characters")
  .max(2000, "Job description must be 2000 characters or fewer")

export const roleSchema = z.object({
  role: requiredText("Role name", { min: 2, max: 60 }),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
})
export type RoleValues = z.infer<typeof roleSchema>

export const dutyHoursSchema = countField("Duty hours", { min: 1, max: 24 })
