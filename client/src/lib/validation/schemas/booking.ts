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
  counter: "Pay Over the Counter",
};

export const paymentMethodSchema = z.enum(PAYMENT_METHODS, {
  errorMap: () => ({ message: "Please select a payment method." }),
});
