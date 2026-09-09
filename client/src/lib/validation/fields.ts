import { z } from "zod"


export function firstError(
  schema: z.ZodTypeAny,
  value: unknown,
  { showWhenEmpty = false } = {},
): string | undefined {
  if (!showWhenEmpty && (value === "" || value === undefined || value === null)) {
    return undefined
  }
  const res = schema.safeParse(value)
  return res.success ? undefined : res.error.issues[0]?.message
}


type TextOpts = { min?: number; max?: number; label?: string }

export function requiredText(label = "This field", opts: TextOpts = {}) {
  const { min, max } = opts
  let schema = z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
  if (min !== undefined) schema = schema.min(min, `${label} must be at least ${min} characters`)
  if (max !== undefined) schema = schema.max(max, `${label} must be ${max} characters or fewer`)
  return schema
}

export function optionalText(opts: TextOpts = {}) {
  const { max = 2000 } = opts
  return z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters`)
    .optional()
    .or(z.literal(""))
}

export function longText(label = "This field", opts: TextOpts = {}) {
  const { min = 10, max = 1000 } = opts
  return z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)
}

export function emailField() {
  return z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
}

export function optionalEmailField() {
  return z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Please enter a valid email address",
    )
}

export function phonePH() {
  return z
    .string({ required_error: "Contact number is required" })
    .trim()
    .min(1, "Contact number is required")
    .regex(/^09\d{9}$/, "Enter an 11-digit mobile number starting with 09")
}

export function optionalPhonePH() {
  return z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^09\d{9}$/.test(v),
      "Enter an 11-digit mobile number starting with 09",
    )
}

export function otpField(length = 6) {
  return z
    .string({ required_error: `Enter the ${length}-digit code` })
    .trim()
    .regex(new RegExp(`^\\d{${length}}$`), `Enter the ${length}-digit code`)
}

export function selectField(label = "an option", empties: string[] = ["", "none"]) {
  return z
    .string({ required_error: `Please select ${label}` })
    .refine((v) => !empties.includes(v), `Please select ${label}`)
}


type MoneyOpts = {
  label?: string
  min?: number
  max?: number
  allowZero?: boolean
  decimals?: number
}

const MAX_MONEY = 9_999_999


export function moneyField(opts: MoneyOpts = {}) {
  const { label = "Amount", min, max = MAX_MONEY, allowZero = false, decimals = 2 } = opts
  const pattern =
    decimals > 0 ? new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`) : /^\d+$/
  const lowerMsg =
    min !== undefined
      ? `${label} must be at least ${min}`
      : allowZero
        ? `${label} cannot be negative`
        : `${label} must be greater than 0`

  return z
    .string({ required_error: `Please enter ${label.toLowerCase()}` })
    .trim()
    .min(1, `Please enter ${label.toLowerCase()}`)
    .refine((v) => pattern.test(v), `Please enter a valid ${label.toLowerCase()}`)
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), `Please enter a valid ${label.toLowerCase()}`)
    .refine((n) => n <= max, `${label} is too large`)
    .refine((n) => {
      if (min !== undefined) return n >= min
      return allowZero ? n >= 0 : n > 0
    }, lowerMsg)
}

export function optionalMoneyField(opts: MoneyOpts = {}) {
  return z
    .union([z.literal(""), moneyField(opts)])
    .transform((v) => (v === "" ? undefined : (v as number)))
}

export function countField(label = "Quantity", { min = 0, max = 1_000_000 } = {}) {
  return z
    .string({ required_error: `Please enter a ${label.toLowerCase()}` })
    .trim()
    .min(1, `Please enter a ${label.toLowerCase()}`)
    .refine((v) => /^\d+$/.test(v), `${label} must be a whole number`)
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n <= max, `${label} is too large`)
    .refine((n) => n >= min, `${label} must be at least ${min}`)
}

export function percentField(
  label = "Percentage",
  { min = 0, max = 100, decimals = 2 }: { min?: number; max?: number; decimals?: number } = {},
) {
  const pattern =
    decimals > 0 ? new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`) : /^\d+$/
  return z
    .string({ required_error: `Please enter a ${label.toLowerCase()}` })
    .trim()
    .min(1, `Please enter a ${label.toLowerCase()}`)
    .refine((v) => pattern.test(v), `Please enter a valid ${label.toLowerCase()}`)
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), `Please enter a valid ${label.toLowerCase()}`)
    .refine((n) => n >= min, `${label} can't be less than ${min}`)
    .refine((n) => n <= max, `${label} can't be more than ${max}`)
}


export function passwordField() {
  return z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer")
}


export const passwordsMatch = {
  check: (v: { password?: string; confirmPassword?: string }) =>
    v.password === v.confirmPassword,
  error: {
    path: ["confirmPassword"] as (string | number)[],
    message: "Passwords don't match",
  },
}


function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function dateField(label = "Date") {
  return z
    .date({
      required_error: `${label} is required`,
      invalid_type_error: `Please choose a valid ${label.toLowerCase()}`,
    })
    .refine((d) => !Number.isNaN(d.getTime()), `Please choose a valid ${label.toLowerCase()}`)
}

export function futureDate(label = "Date") {
  return dateField(label).refine(
    (d) => d >= startOfToday(),
    `${label} can't be in the past`,
  )
}


export function dateStringField(
  label = "Date",
  { future = false, past = false }: { future?: boolean; past?: boolean } = {},
) {
  return z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      `Please choose a valid ${label.toLowerCase()}`,
    )
    .refine(
      (v) => !future || new Date(`${v}T00:00:00`) >= startOfToday(),
      `${label} must be in the future`,
    )
    .refine(
      (v) => !past || new Date(`${v}T00:00:00`) <= startOfToday(),
      `${label} can't be in the future`,
    )
}

export function optionalDigits(label = "This field", { min = 1, max = 20 } = {}) {
  return z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && v.length >= min && v.length <= max),
      `Enter a valid ${label} (${min === max ? `${min}` : `${min}–${max}`} digits)`,
    )
}


type ImageOpts = { maxMB?: number; types?: string[] }

const DEFAULT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

function baseImageSchema({ maxMB = 5, types = DEFAULT_IMAGE_TYPES }: ImageOpts) {
  const hasFile = typeof File !== "undefined"
  return (hasFile ? z.instanceof(File) : z.any())
    .refine((f: File) => !hasFile || f instanceof File, "Please choose an image")
    .refine(
      (f: File) => !f || f.size <= maxMB * 1024 * 1024,
      `Image must be under ${maxMB} MB`,
    )
    .refine((f: File) => !f || types.includes(f.type), "Use a JPG, PNG or WebP image")
}

export function imageFile(opts: ImageOpts = {}) {
  return baseImageSchema(opts).refine((f: File) => !!f, "Please choose an image")
}

export function optionalImageFile(opts: ImageOpts = {}) {
  return baseImageSchema(opts).nullable().optional()
}

type MediaOpts = { imageMB?: number; videoMB?: number }


export function mediaFile({ imageMB = 8, videoMB = 50 }: MediaOpts = {}) {
  const hasFile = typeof File !== "undefined"
  return (hasFile ? z.instanceof(File) : z.any())
    .refine((f: File) => !!f, "Please choose a file")
    .refine(
      (f: File) => !f || f.type.startsWith("image/") || f.type.startsWith("video/"),
      "Only image or video files are allowed",
    )
    .refine((f: File) => {
      if (!f) return true
      const cap = (f.type.startsWith("video/") ? videoMB : imageMB) * 1024 * 1024
      return f.size <= cap
    }, `Image must be under ${imageMB} MB and video under ${videoMB} MB`)
}
