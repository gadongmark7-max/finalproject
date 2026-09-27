import mongoose, { Schema } from "mongoose";

export const EXPENSE_CATEGORIES = [
  "Ink",
  "Needles & Cartridges",
  "Gloves",
  "Equipment",
  "Tattoo Machines",
  "Studio Supplies",
  "Aftercare Supplies",
  "Rent",
  "Utilities",
  "Marketing",
  "Inventory Usage",
  "Other",
] as const;

export const EXPENSE_SOURCES = ["manual", "booking_inventory"] as const;

const ExpencesSchema = new Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accounts",
      required: true,
    },
    cost: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    recordedBy: { type: String, required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: "Other" },
    notes: { type: String, required: false },
    source: { type: String, enum: EXPENSE_SOURCES, default: "manual" },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookings",
      required: false,
    },
  },
  { timestamps: true },
);

ExpencesSchema.index(
  { booking: 1, source: 1 },
  { unique: true, partialFilterExpression: { source: "booking_inventory" } },
);

export default mongoose.model("Expences", ExpencesSchema);
