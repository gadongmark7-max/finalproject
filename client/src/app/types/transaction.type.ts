import { accountInterface } from "./accounts.type";
import { PaymentMethod } from "@/lib/validation/schemas/booking";

export interface transactionInterfaceInput {
  sender: string;
  receiver: string;
  date: string;
  time: string;
  refId: string;
  amount: number;
  bookingId?: string;
}

export interface transactionInterface {
  _id: string;
  sender: accountInterface;
  receiver: accountInterface;
  date: string;
  time: string;
  refId: string;
  amount: number;
  bookingId?: string;
  paymentMethod?: PaymentMethod;
  type?: TransactionType;
  refundedAt?: string | null;
}

export type TransactionType = "payment" | "refund";

export const isRefundRecord = (transaction: { type?: TransactionType }) =>
  transaction.type === "refund";

export const isRefundedPayment = (transaction: {
  type?: TransactionType;
  refundedAt?: string | null;
}) => !isRefundRecord(transaction) && !!transaction.refundedAt;

export const formatRefundDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString("en-US")} · ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

export interface transactionReceiptBookingInterface {
  _id: string;
  tattooImg: string;
  originalPrice: number;
  balance: number;
  date: string;
  time: string[];
  duration: number;
  status: string;
  session?: number;
  paymentMethod?: PaymentMethod;
}

export interface transactionReceiptInterface extends Omit<
  transactionInterface,
  "bookingId"
> {
  bookingId?: transactionReceiptBookingInterface | null;
}
