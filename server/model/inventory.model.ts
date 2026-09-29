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
  "pair",
  "box",
  "pack",
  "sheets",
  "rolls",
  "bottles",
  "tubes",
  "sets",
] as const;

export const MEASURED_INVENTORY_UNITS = ["ml", "L"] as const;

export const isWholeNumberUnit = (unit: string) =>
  (INVENTORY_UNITS as readonly string[]).includes(unit) &&
  !(MEASURED_INVENTORY_UNITS as readonly string[]).includes(unit);

export const isMeasuredUnit = (unit: string) =>
  (MEASURED_INVENTORY_UNITS as readonly string[]).includes(unit);

export const ML_PER_UNIT: Record<string, number> = { ml: 1, L: 1000 };

export const INK_INVENTORY_CATEGORY = "INKS & PIGMENTS";

export const isInkCategory = (category: string) =>
  category.trim().toUpperCase() === INK_INVENTORY_CATEGORY;

export const isMeasuredInkItem = (item: { category: string; type: string }) =>
  isInkCategory(item.category) && ML_PER_UNIT[item.type] !== undefined;

const Inventorychema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  item: { type: String, required: true },
  category: { type: String, required: true },
  stocks: { type: Number, required: true },
  quantityPerItem: { type: Number, default: null },
  type: { type: String, required: true },
  safeStock: { type: Number, required: true },
  price: { type: Number, required: true },
});

export default mongoose.model("Inventory", Inventorychema);
