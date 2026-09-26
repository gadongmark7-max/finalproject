import { z } from "zod"

export const MAX_SESSION_HOURS = 24

export const sessionHoursSchema = z
  .number({ invalid_type_error: "Enter the hours for each session" })
  .int("Session hours must be whole numbers")
  .min(1, "Each session must be at least 1 hour")
  .max(MAX_SESSION_HOURS, `Each session can be at most ${MAX_SESSION_HOURS} hours`)

export const sessionsSchema = z
  .array(sessionHoursSchema)
  .min(1, "Add at least one session")

export const sessionHoursFromInput = (raw: string) =>
  Number(raw.replace(/\D/g, "").slice(0, 2))
