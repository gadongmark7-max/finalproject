import { z } from "zod";
import { isValidObjectId } from "mongoose";
import {
  CANCELLATION_REASON_CODES,
  CancellationReasonCode,
  REFUND_METHODS,
} from "../model/booking.model";

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

export const MAX_PLANNED_SESSIONS = 30;

export const completedSessionsSchema = z
  .array(
    z.object({
      session: z.coerce
        .number({ invalid_type_error: "Session must be a number" })
        .int("Session must be a whole number")
        .positive("Session must be a positive number"),
      materials: sessionMaterialsSchema,
    }),
  )
  .max(MAX_PLANNED_SESSIONS, "Too many sessions")
  .refine(
    (items) => new Set(items.map((i) => i.session)).size === items.length,
    "Each session can only be listed once",
  );

export const plannedSessionMaterialsSchema = z
  .array(sessionMaterialsSchema)
  .max(MAX_PLANNED_SESSIONS, "Too many sessions");

export const completeBookingSchema = z.object({
  materials: sessionMaterialsSchema.optional(),
  sessions: completedSessionsSchema.optional(),
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

export const CANCELLATION_REASON_LABELS: Record<CancellationReasonCode, string> =
  {
    change_of_plans: "Change of plans",
    unable_to_attend: "Unable to attend the scheduled appointment",
    financial: "Budget or financial reasons",
    health_personal: "Health or personal reasons",
    artist_schedule: "Artist or schedule-related concerns",
    other: "Others",
  };

export const CANCELLATION_DETAILS_MAX = 500;

export const clientCancelBookingSchema = z
  .object({
    reasonCode: z.enum(CANCELLATION_REASON_CODES, {
      errorMap: () => ({ message: "Please select a cancellation reason" }),
    }),
    reasonDetails: z
      .string()
      .trim()
      .max(CANCELLATION_DETAILS_MAX, "Explanation is too long")
      .optional()
      .default(""),
    refundMethod: z
      .enum(REFUND_METHODS, {
        errorMap: () => ({ message: "Please select a refund method" }),
      })
      .nullable()
      .optional()
      .default(null),
  })
  .superRefine((value, ctx) => {
    if (value.reasonCode === "other" && value.reasonDetails.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reasonDetails"],
        message: "Please specify your reason",
      });
    }
  });

export type ClientCancelBookingInput = z.infer<typeof clientCancelBookingSchema>;

export const refundBookingSchema = z.object({
  method: z.enum(REFUND_METHODS, {
    errorMap: () => ({ message: "Choose cash or PayMongo" }),
  }),
});

export type SessionMaterialInput = z.infer<typeof sessionMaterialSchema>;
