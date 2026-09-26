import { z } from "zod";

import {
  moneyField,
  requiredText,
  selectField,
} from "@/lib/validation/fields";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from "@/app/types/inventory.type";

const categoryField = selectField("a category").pipe(
  z.enum(INVENTORY_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
);
const unitField = selectField("a unit").pipe(
  z.enum(INVENTORY_UNITS, {
    errorMap: () => ({ message: "Please select a valid unit" }),
  }),
);

const quantityField = (label: string, { allowZero = false } = {}) =>
  moneyField({ label, allowZero, max: 1_000_000 });

export const inventoryPriceSchema = moneyField({
  label: "Price",
  allowZero: true,
  max: 1_000_000,
});

export const addItemSchema = z.object({
  item: requiredText("Item name", { min: 2, max: 80 }),
  category: categoryField,
  type: unitField,
  stocks: quantityField("Quantity"),
  safeStock: quantityField("Safe stock", { allowZero: true }),
  expences: moneyField({ label: "Expense", allowZero: true }),
});
export type AddItemValues = z.infer<typeof addItemSchema>;

export const updateItemSchema = z.object({
  item: requiredText("Item name", { min: 2, max: 80 }),
  category: selectField("a category"),
  stocks: quantityField("Quantity", { allowZero: true }),
  safeStock: quantityField("Safe stock", { allowZero: true }),
});
export type UpdateItemValues = z.infer<typeof updateItemSchema>;

export const updateItemWithPriceSchema = updateItemSchema.extend({
  price: inventoryPriceSchema,
});

export const addStocksSchema = z.object({
  stocks: quantityField("Quantity"),
});
export type AddStocksValues = z.infer<typeof addStocksSchema>;

export const addStocksWithExpenseSchema = z.object({
  stocks: quantityField("Quantity"),
  expences: moneyField({ label: "Expense", allowZero: true }),
});
export type AddStocksWithExpenseValues = z.infer<
  typeof addStocksWithExpenseSchema
>;
