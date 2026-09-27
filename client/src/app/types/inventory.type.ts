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
  "box",
  "pack",
  "sheets",
  "rolls",
  "bottles",
  "tubes",
  "sets",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface inventoryInterfaceInput {
  account: string;
  item: string;
  category: string;
  stocks: number;
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
