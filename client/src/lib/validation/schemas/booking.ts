import { z } from "zod";

import {
  emailField,
  moneyField,
  phonePH,
  requiredText,
} from "@/lib/validation/fields";

export { firstError } from "@/lib/validation/fields";

export const priceField = moneyField({ label: "Price", min: 50 });

export const bookingClientSchema = z.object({
  clientName: requiredText("Client name", { min: 2, max: 80 }),
  clientEmail: emailField(),
  clientContact: phonePH(),
});
export type BookingClientValues = z.infer<typeof bookingClientSchema>;

export const PAYMENT_METHODS = ["online", "counter"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  online: "Online Payment",
  counter: "Over-the-Counter",
};

export const BOOKING_PAYMENT_STATUSES = ["awaiting", "partial", "paid"] as const;
export type BookingPaymentStatus = (typeof BOOKING_PAYMENT_STATUSES)[number];

export const AWAITING_PAYMENT_LABEL = "Awaiting Payment";

export const BOOKING_PAYMENT_STATUS_LABELS: Record<BookingPaymentStatus, string> =
  {
    awaiting: AWAITING_PAYMENT_LABEL,
    partial: "Partially Paid",
    paid: "Paid",
  };

export function bookingPaymentLabel(booking: {
  status?: string;
  paymentStatus?: BookingPaymentStatus;
  paymentMethod?: PaymentMethod;
  closure?: { type: string } | null;
}): string {
  if (booking.status === "refund") return "Refunded";
  if (booking.status === "appointment") return "Not Billed Yet";
  if (!booking.paymentStatus || booking.paymentStatus === "awaiting") {
    return booking.status === "cancelled" || booking.closure
      ? "No Payment"
      : AWAITING_PAYMENT_LABEL;
  }
  if (booking.closure && booking.paymentStatus === "partial") {
    return `Closed Early · ${PAYMENT_METHOD_LABELS[booking.paymentMethod ?? "online"]}`;
  }
  const method = PAYMENT_METHOD_LABELS[booking.paymentMethod ?? "online"];
  return `${BOOKING_PAYMENT_STATUS_LABELS[booking.paymentStatus]} · ${method}`;
}

export const paymentMethodSchema = z.enum(PAYMENT_METHODS, {
  errorMap: () => ({ message: "Please select a payment method." }),
});

const hoursLabel = (hours: number) =>
  `${hours} ${hours === 1 ? "hour" : "hours"}`;

export const toWholeSessionHours = (hours: number) =>
  Math.ceil(Math.round(hours * 1e6) / 1e6);

export const requiredSessionHours = (sessions: number[], session = 1) => {
  const hours = Number(sessions?.[session - 1]);
  return Number.isFinite(hours) && hours > 0 ? toWholeSessionHours(hours) : null;
};

const toMinutes = (time: unknown) => {
  if (typeof time !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const bookingDurationHours = (times: unknown[]) => {
  if (times.length < 2) return 0;
  const minutes = times.map(toMinutes);
  if (minutes.some((m) => m === null)) return null;
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i]! - minutes[i - 1]! !== 60) return null;
  }
  return times.length - 1;
};

export const insufficientDurationMessage = (
  requiredHours: number,
  selectedHours: number,
  totalSessions: number,
) => {
  const subject =
    totalSessions > 1
      ? `Session 1 of this tattoo (${totalSessions} sessions total) requires ${hoursLabel(requiredHours)}`
      : `This tattoo requires ${hoursLabel(requiredHours)}`;
  return `${subject}, so the booking duration must be at least ${hoursLabel(requiredHours)}. The selected time only covers ${hoursLabel(selectedHours)}.`;
};
