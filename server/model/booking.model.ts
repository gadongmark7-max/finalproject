import mongoose, { Schema } from "mongoose";

const TattooDataSchema = new mongoose.Schema(
  {
    modelUrl: { type: String, required: true },
    meshName: { type: String, required: true },

    size: { type: Number, required: true },

    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },

    rotation: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      order: {
        type: String,
        enum: ["XYZ", "YXZ", "ZXY", "ZYX", "YZX", "XZY"],
        required: true,
      },
    },

    scale: { type: Number, required: true },

    uv: {
      u: { type: Number },
      v: { type: Number },
    },

    colorMode: {
      type: String,
      enum: ["original", "bw"],
      default: "original",
      required: false,
    },
  },
  { _id: false },
);

const ConsumedItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    item: { type: String, required: true },
    unit: { type: String, required: false },
    qty: { type: Number, required: true },
    deducted: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    cost: { type: Number, required: true },
    missing: { type: Boolean, default: false },
  },
  { _id: false },
);

const InventoryConsumptionSchema = new Schema(
  {
    consumedAt: { type: Date, required: true },
    items: [ConsumedItemSchema],
    totalCost: { type: Number, required: true },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expences",
      default: null,
    },
  },
  { _id: false },
);

export const CHECKOUT_SESSION_STATUSES = ["pending", "paid", "expired"] as const;

const CheckoutSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true },
    status: {
      type: String,
      enum: CHECKOUT_SESSION_STATUSES,
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    checkedAt: { type: Date, default: null },
  },
  { _id: false },
);

const BookingSchema = new Schema({
  bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "Accounts" },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  tattooImg: { type: String, required: true },
  sessions: [{ type: Number, required: true }],
  session: { type: Number, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
  time: [{ type: String, required: true }],
  status: { type: String, required: true },
  isReviewed: { type: Boolean, required: true },
  originalPrice: { type: Number, required: true },
  balance: { type: Number, required: true },
  itemUsed: [
    {
      itemId: { type: String, required: true },
      item: { type: String, required: true },
      qty: { type: Number, required: true },
    },
  ],
  tattooData: {
    type: TattooDataSchema,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "counter"],
    required: false,
  },
  inventoryConsumption: {
    type: InventoryConsumptionSchema,
    default: null,
  },
  checkoutSessions: {
    type: [CheckoutSessionSchema],
    default: [],
    select: false,
  },
}, {
  toJSON: { virtuals: ["paymentStatus"] },
});

export const BOOKING_PAYMENT_STATUSES = ["awaiting", "partial", "paid"] as const;
export type BookingPaymentStatus = (typeof BOOKING_PAYMENT_STATUSES)[number];

export function getBookingPaymentStatus(
  originalPrice: number,
  balance: number,
): BookingPaymentStatus {
  if (!(Number(balance) > 0)) return "paid";
  if (Number(balance) >= Number(originalPrice)) return "awaiting";
  return "partial";
}

BookingSchema.virtual("paymentStatus").get(function () {
  return getBookingPaymentStatus(this.originalPrice, this.balance);
});

export default mongoose.model("Bookings", BookingSchema);
