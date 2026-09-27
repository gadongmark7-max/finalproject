import { z } from "zod";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from "../model/inventory.model";

const MAX_PRICE = 1_000_000;
const MAX_STOCK = 1_000_000;

export const inventoryCategoryField = z.enum(INVENTORY_CATEGORIES, {
  errorMap: () => ({ message: "Please select a valid category" }),
});

export const inventoryUnitField = z.enum(INVENTORY_UNITS, {
  errorMap: () => ({ message: "Please select a valid unit" }),
});

export const inventoryPriceField = z.coerce
  .number({ invalid_type_error: "Price must be a number" })
  .finite("Price must be a number")
  .nonnegative("Price cannot be negative")
  .max(MAX_PRICE, "Price looks too large, please double-check")
  .transform((n) => Math.round(n * 100) / 100);

const stockField = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .finite(`${label} must be a number`)
    .nonnegative(`${label} cannot be negative`)
    .max(MAX_STOCK, `${label} looks too large, please double-check`)
    .transform((n) => Math.round(n * 100) / 100);

export const addStocksQuantityField = stockField("Quantity").refine(
  (n) => n > 0,
  "Quantity must be greater than 0",
);

const itemNameField = z
  .string({ required_error: "Item name is required" })
  .trim()
  .min(2, "Item name must be at least 2 characters")
  .max(80, "Item name must be at most 80 characters");

export const addInventoryItemSchema = z.object({
  item: itemNameField,
  category: inventoryCategoryField,
  type: inventoryUnitField,
  stocks: stockField("Quantity").refine((n) => n > 0, "Quantity must be greater than 0"),
  safeStock: stockField("Safe stock"),
  price: inventoryPriceField,
});


export const updateInventoryItemSchema = z.object({
  _id: z.string().min(1, "Item id is required"),
  item: itemNameField.optional(),
  category: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  stocks: stockField("Quantity").optional(),
  safeStock: stockField("Safe stock").optional(),
  price: inventoryPriceField.optional(),
});

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
