import mongoose, { Schema } from "mongoose";

export const TRANSACTION_TYPES = ["payment", "refund"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["pending", "completed", "failed"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

const TransactionSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  refId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bookings",
    required: false,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "counter"],
    required: false,
  },
  type: {
    type: String,
    enum: TRANSACTION_TYPES,
    default: "payment",
  },
  refundedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: TRANSACTION_STATUSES,
    default: "completed",
  },
  refundOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transactions",
    default: null,
  },
  providerPaymentId: { type: String, default: null },
  providerRefundId: { type: String, default: null },
  failureReason: { type: String, default: null },
  checkedAt: { type: Date, default: null },
});

export default mongoose.model("Transactions", TransactionSchema);
