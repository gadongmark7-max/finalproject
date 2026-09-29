import { z } from "zod";

import {
  moneyField,
  requiredText,
  selectField,
} from "@/lib/validation/fields";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  isWholeNumberUnit,
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

type StockFields = { stocks?: number; safeStock?: number };

type OriginalStock = { type: string; stocks: number; safeStock: number };

const STOCK_FIELD_LABELS = [
  ["stocks", "Quantity"],
  ["safeStock", "Safe stock"],
] as const;

const requireWholeNumbers = (
  unit: string,
  values: StockFields,
  ctx: z.RefinementCtx,
  original?: OriginalStock,
) => {
  if (!isWholeNumberUnit(unit)) return;
  for (const [field, label] of STOCK_FIELD_LABELS) {
    const value = values[field];
    if (value === undefined || Number.isInteger(value)) continue;
    if (original && original.type === unit && original[field] === value) continue;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message: `${label} must be a whole number for ${unit}`,
    });
  }
};

export const addItemSchema = z
  .object({
    item: requiredText("Item name", { min: 2, max: 80 }),
    category: categoryField,
    type: unitField,
    stocks: quantityField("Quantity"),
    safeStock: quantityField("Safe stock", { allowZero: true }),
    expences: moneyField({ label: "Expense", allowZero: true }),
  })
  .superRefine((values, ctx) => requireWholeNumbers(values.type, values, ctx));
export type AddItemValues = z.infer<typeof addItemSchema>;

const updateItemBaseSchema = z.object({
  item: requiredText("Item name", { min: 2, max: 80 }),
  category: selectField("a category"),
  stocks: quantityField("Quantity", { allowZero: true }),
  safeStock: quantityField("Safe stock", { allowZero: true }),
});

export const updateItemSchemaFor = (original: OriginalStock) =>
  updateItemBaseSchema.superRefine((values, ctx) =>
    requireWholeNumbers(original.type, values, ctx, original),
  );
export type UpdateItemValues = z.infer<typeof updateItemBaseSchema>;

export const updateItemWithPriceSchemaFor = (original: OriginalStock) =>
  updateItemBaseSchema
    .extend({
      type: selectField("a unit"),
      price: inventoryPriceSchema,
    })
    .superRefine((values, ctx) =>
      requireWholeNumbers(values.type, values, ctx, original),
    );

const addStocksBaseSchema = z.object({
  stocks: quantityField("Quantity"),
});

export const addStocksSchemaFor = (unit: string) =>
  addStocksBaseSchema.superRefine((values, ctx) =>
    requireWholeNumbers(unit, values, ctx),
  );
export type AddStocksValues = z.infer<typeof addStocksBaseSchema>;

const addStocksWithExpenseBaseSchema = addStocksBaseSchema.extend({
  expences: moneyField({ label: "Expense", allowZero: true }),
});

export const addStocksWithExpenseSchemaFor = (unit: string) =>
  addStocksWithExpenseBaseSchema.superRefine((values, ctx) =>
    requireWholeNumbers(unit, values, ctx),
  );
export type AddStocksWithExpenseValues = z.infer<
  typeof addStocksWithExpenseBaseSchema
>;
