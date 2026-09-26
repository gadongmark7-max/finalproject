import mongoose, { Schema } from "mongoose";

export const INVENTORY_CATEGORIES = [
  "INKS & PIGMENTS",
  "NEEDLES & CARTRIDGES",
  "TATTOO EQUIPMENT",
  "INK & DISPOSABLE SUPPLIES",
  "PPE",
  "SKIN PREPARATION",
  "STENCIL SUPPLIES",
  "BARRIERS & PROTECTION",
  "CLEANING & SANITIZATION",
  "WASTE DISPOSAL",
  "AFTERCARE",
  "STUDIO / GENERAL SUPPLIES",
] as const;

export const INVENTORY_UNITS = [
  "ml",
  "L",
  "pcs",
  "box",
  "pack",
  "sheets",
  "rolls",
  "bottles",
  "tubes",
  "sets",
] as const;

const Inventorychema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  item: { type: String, required: true },
  category: { type: String, required: true },
  stocks: { type: Number, required: true },
  type: { type: String, required: true },
  safeStock: { type: Number, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model("Inventory", Inventorychema);
