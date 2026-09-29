import { accountInterface } from "./accounts.type";

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

export const INK_INVENTORY_CATEGORY = "INKS & PIGMENTS";

const roundQuantity = (n: number) => Math.round(n * 100) / 100;

export const itemCountOf = (
  item: Pick<inventoryInterface, "stocks" | "quantityPerItem">,
) =>
  item.quantityPerItem ? roundQuantity(item.stocks / item.quantityPerItem) : null;

export const totalFromItems = (itemCount: number, quantityPerItem: number) =>
  roundQuantity(itemCount * quantityPerItem);

export const formatQuantity = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export const quantityInputMode = (unit: string) =>
  isWholeNumberUnit(unit) ? "numeric" : "decimal";

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface inventoryInterfaceInput {
  account: string;
  item: string;
  category: string;
  stocks: number;
  quantityPerItem?: number | null;
  type: string;
  safeStock: number;
  price: number;
}

export interface inventoryInterface {
  _id: string;
  account: accountInterface;
  item: string;
  category: string;
  stocks: number;
  quantityPerItem?: number | null;
  type: string;
  safeStock: number;
  price: number;
}

export interface inventoryLogInterfaceInput {
  account: string;
  date: string;
  time: string;
  message: string;
  type: string;
  actionBy: string;
}

export interface inventoryLogInterface {
  _id: string;
  account: string;
  date: string;
  time: string;
  message: string;
  type: string;
  actionBy: string;
}
