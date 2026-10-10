import { z } from "zod";
import { isValidObjectId } from "mongoose";

export const MAX_SESSION_MATERIALS = 50;
const MAX_MATERIAL_QTY = 1_000_000;

export const sessionMaterialSchema = z.object({
  itemId: z
    .string({ required_error: "Inventory item is required" })
    .refine((id) => isValidObjectId(id), "Invalid inventory item"),
  qty: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .finite("Quantity must be a number")
    .positive("Quantity must be greater than 0")
    .max(MAX_MATERIAL_QTY, "Quantity looks too large, please double-check")
    .refine(
      (n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6,
      "Quantity can have at most 2 decimal places",
    ),
});

export const sessionMaterialsSchema = z
  .array(sessionMaterialSchema)
  .max(MAX_SESSION_MATERIALS, "Too many materials for one session")
  .refine(
    (items) => new Set(items.map((i) => i.itemId)).size === items.length,
    "Each inventory item can only be listed once",
  );

export const recordSessionMaterialsSchema = z.object({
  session: z.coerce
    .number({ invalid_type_error: "Session must be a number" })
    .int("Session must be a whole number")
    .positive("Session must be a positive number"),
  materials: sessionMaterialsSchema,
});

export const completeBookingSchema = z.object({
  materials: sessionMaterialsSchema.optional(),
  closeEarly: z.boolean().optional().default(false),
  reason: z.string().trim().max(500, "Reason is too long").optional(),
});

export const cancelBookingSchema = z.object({
  reason: z
    .string({ required_error: "Please give a reason for the cancellation" })
    .trim()
    .min(3, "Please give a reason for the cancellation")
    .max(500, "Reason is too long"),
});

export type SessionMaterialInput = z.infer<typeof sessionMaterialSchema>;
