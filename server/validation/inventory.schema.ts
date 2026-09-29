import { z } from "zod";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  isMeasuredUnit,
  isWholeNumberUnit,
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

export const wholeNumberUnitError = (
  label: string,
  unit: string,
  value: number | undefined,
) =>
  value !== undefined && isWholeNumberUnit(unit) && !Number.isInteger(value)
    ? `${label} must be a whole number for ${unit}`
    : null;

const round2 = (n: number) => Math.round(n * 100) / 100;

const positiveAmountField = (label: string) =>
  stockField(label).refine((n) => n > 0, `${label} must be greater than 0`);

const optionalQuantityPerItemField = z.preprocess(
  (v) => (v === "" ? null : v),
  positiveAmountField("Amount per item").nullable().optional(),
);

export const quantityPerItemUnitError = (
  unit: string,
  quantityPerItem: number | null | undefined,
) =>
  quantityPerItem != null && !isMeasuredUnit(unit)
    ? `Amount per item only applies to measured units (ml or L), not ${unit}`
    : null;

export const totalFromItems = (itemCount: number, quantityPerItem: number) =>
  round2(itemCount * quantityPerItem);

export const addInventoryItemSchema = z
  .object({
    item: itemNameField,
    category: inventoryCategoryField,
    type: inventoryUnitField,
    stocks: positiveAmountField("Quantity").optional(),
    itemCount: positiveAmountField("Number of items").optional(),
    quantityPerItem: optionalQuantityPerItemField,
    safeStock: stockField("Safe stock"),
    price: inventoryPriceField,
  })
  .superRefine((values, ctx) => {
    const qpiError = quantityPerItemUnitError(values.type, values.quantityPerItem);
    if (qpiError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantityPerItem"], message: qpiError });
      return;
    }
    if (values.quantityPerItem != null) {
      if (values.itemCount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["itemCount"],
          message: "Number of items is required",
        });
      } else if (totalFromItems(values.itemCount, values.quantityPerItem) > MAX_STOCK) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["itemCount"],
          message: "Total quantity looks too large, please double-check",
        });
      }
      return;
    }
    if (values.stocks === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stocks"],
        message: "Quantity is required",
      });
      return;
    }
    for (const [field, label] of [
      ["stocks", "Quantity"],
      ["safeStock", "Safe stock"],
    ] as const) {
      const message = wholeNumberUnitError(label, values.type, values[field]);
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
      }
    }
  })
  .transform(({ itemCount, quantityPerItem, stocks, ...rest }) => ({
    ...rest,
    quantityPerItem: quantityPerItem ?? null,
    stocks:
      quantityPerItem != null && itemCount !== undefined
        ? totalFromItems(itemCount, quantityPerItem)
        : (stocks as number),
  }));

export const updateInventoryItemSchema = z.object({
  _id: z.string().min(1, "Item id is required"),
  item: itemNameField.optional(),
  category: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  stocks: stockField("Quantity").optional(),
  itemCount: stockField("Number of items").optional(),
  quantityPerItem: optionalQuantityPerItemField,
  safeStock: stockField("Safe stock").optional(),
  price: inventoryPriceField.optional(),
});

export const addStocksItemCountField = positiveAmountField("Number of items");

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
