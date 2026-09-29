import { z } from "zod";

import {
  countField,
  moneyField,
  positiveDecimalField,
  requiredText,
  selectField,
} from "@/lib/validation/fields";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  isMeasuredUnit,
  isWholeNumberUnit,
  totalFromItems,
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

type OriginalStock = {
  type: string;
  stocks: number;
  safeStock: number;
  quantityPerItem?: number | null;
};

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

const optionalAmountText = z.string().optional().default("");

const parseAmount = (
  raw: string,
  label: string,
  path: string,
  ctx: z.RefinementCtx,
  { allowZero = false } = {},
) => {
  const result = quantityField(label, { allowZero }).safeParse(raw);
  if (result.success) return result.data;
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [path],
    message: result.error.issues[0]?.message ?? `Please enter ${label.toLowerCase()}`,
  });
  return undefined;
};

export const addItemWithItemsSchema = z
  .object({
    item: requiredText("Item name", { min: 2, max: 80 }),
    category: categoryField,
    type: unitField,
    stocks: optionalAmountText,
    itemCount: optionalAmountText,
    quantityPerItem: optionalAmountText,
    safeStock: quantityField("Safe stock", { allowZero: true }),
    expences: moneyField({ label: "Expense", allowZero: true }),
  })
  .transform((values, ctx) => {
    const base = {
      item: values.item,
      category: values.category,
      type: values.type,
      safeStock: values.safeStock,
      expences: values.expences,
    };
    if (isMeasuredUnit(values.type)) {
      const itemCount = parseAmount(values.itemCount, "Number of items", "itemCount", ctx);
      const quantityPerItem = parseAmount(
        values.quantityPerItem,
        "Amount per item",
        "quantityPerItem",
        ctx,
      );
      if (itemCount === undefined || quantityPerItem === undefined) return z.NEVER;
      return {
        ...base,
        itemCount,
        quantityPerItem,
        stocks: totalFromItems(itemCount, quantityPerItem),
      };
    }
    const stocks = parseAmount(values.stocks, "Quantity", "stocks", ctx);
    if (stocks === undefined) return z.NEVER;
    requireWholeNumbers(values.type, { stocks, safeStock: values.safeStock }, ctx);
    return { ...base, itemCount: undefined, quantityPerItem: null, stocks };
  });

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
  z
    .object({
      item: requiredText("Item name", { min: 2, max: 80 }),
      category: selectField("a category"),
      type: selectField("a unit"),
      price: inventoryPriceSchema,
      safeStock: quantityField("Safe stock", { allowZero: true }),
      stocks: optionalAmountText,
      itemCount: optionalAmountText,
      quantityPerItem: optionalAmountText,
    })
    .transform((values, ctx) => {
      const base = {
        item: values.item,
        category: values.category,
        type: values.type,
        price: values.price,
        safeStock: values.safeStock,
      };
      if (isMeasuredUnit(values.type) && values.quantityPerItem.trim() !== "") {
        const quantityPerItem = parseAmount(
          values.quantityPerItem,
          "Amount per item",
          "quantityPerItem",
          ctx,
        );
        const itemCount = parseAmount(
          values.itemCount,
          "Number of items",
          "itemCount",
          ctx,
          { allowZero: true },
        );
        if (itemCount === undefined || quantityPerItem === undefined) return z.NEVER;
        const unchanged =
          original.type === values.type &&
          original.quantityPerItem === quantityPerItem &&
          totalFromItems(original.stocks / quantityPerItem, 1) === itemCount;
        return unchanged
          ? { ...base, quantityPerItem, itemCount: undefined, stocks: original.stocks }
          : {
              ...base,
              quantityPerItem,
              itemCount,
              stocks: totalFromItems(itemCount, quantityPerItem),
            };
      }
      const stocks = parseAmount(values.stocks, "Quantity", "stocks", ctx, {
        allowZero: true,
      });
      if (stocks === undefined) return z.NEVER;
      requireWholeNumbers(
        values.type,
        { stocks, safeStock: values.safeStock },
        ctx,
        original,
      );
      return { ...base, quantityPerItem: null, itemCount: undefined, stocks };
    });

const addStocksBaseSchema = z.object({
  stocks: quantityField("Quantity"),
});

export const addStocksSchemaFor = (unit: string, byItems = false) =>
  byItems
    ? z.object({ stocks: quantityField("Number of items") })
    : addStocksBaseSchema.superRefine((values, ctx) =>
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

export const itemUsedQtySchemaFor = (unit: string) =>
  isMeasuredUnit(unit)
    ? positiveDecimalField({ label: "Quantity", max: 1_000_000 })
    : countField("Quantity", { min: 1 });

export const sanitizeItemUsedQty = (value: string, unit: string) =>
  isMeasuredUnit(unit)
    ? value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")
    : value.replace(/\D/g, "");
