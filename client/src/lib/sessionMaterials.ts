import {
  inventoryInterface,
  isMeasuredUnit,
} from "@/app/types/inventory.type";
import { itemUsedQtySchemaFor } from "@/lib/validation/schemas/inventory";

export type MaterialRowSource = "ai" | "estimate" | "manual" | "recorded";

export interface MaterialRow {
  key: string;
  itemId: string;
  qty: string;
  source: MaterialRowSource;
  originalQty?: number;
}

export interface EvaluatedMaterialRow extends MaterialRow {
  item: inventoryInterface | undefined;
  qtyNum: number | null;
  cost: number;
  error: string | null;
  adjusted: boolean;
}

export interface MaterialQuantity {
  itemId: string;
  qty: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

let keySeed = 0;
export const newRowKey = () => `m${Date.now().toString(36)}${(keySeed++).toString(36)}`;

export const formatQty = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export function splitAcrossSessions(
  lines: { itemId: string; qty: number; unit: string }[],
  sessionHours: number[],
): MaterialQuantity[][] {
  const count = Math.max(1, sessionHours.length);
  const weights = sessionHours.map((h) => (Number(h) > 0 ? Number(h) : 0));
  const weightSum = weights.reduce((s, w) => s + w, 0);
  const shares =
    weightSum > 0
      ? weights.map((w) => w / weightSum)
      : Array<number>(count).fill(1 / count);

  const result: MaterialQuantity[][] = Array.from({ length: count }, () => []);
  for (const line of lines) {
    const step = isMeasuredUnit(line.unit) ? 100 : 1;
    const totalUnits = Math.round(line.qty * step);
    if (totalUnits <= 0) continue;
    const raw = shares.map((s) => s * totalUnits);
    const base = raw.map(Math.floor);
    let remaining = totalUnits - base.reduce((s, b) => s + b, 0);
    const order = raw
      .map((r, i) => ({ i, frac: r - Math.floor(r) }))
      .sort((a, b) => b.frac - a.frac || a.i - b.i);
    for (const { i } of order) {
      if (remaining <= 0) break;
      base[i] += 1;
      remaining -= 1;
    }
    base.forEach((units, i) => {
      if (units > 0) result[i].push({ itemId: line.itemId, qty: units / step });
    });
  }
  return result;
}

export const rowsFrom = (
  quantities: MaterialQuantity[],
  source: MaterialRowSource,
): MaterialRow[] =>
  quantities.map((q) => ({
    key: newRowKey(),
    itemId: q.itemId,
    qty: String(q.qty),
    source,
    originalQty: q.qty,
  }));

export const emptyRow = (): MaterialRow => ({
  key: newRowKey(),
  itemId: "",
  qty: "",
  source: "manual",
});

export function evaluateRows(
  rows: MaterialRow[],
  inventory: inventoryInterface[] | undefined,
  stockLeft?: Map<string, number>,
): EvaluatedMaterialRow[] {
  return rows.map((row) => {
    const item = inventory?.find((i) => i._id === row.itemId);
    const parsed = item ? itemUsedQtySchemaFor(item.type).safeParse(row.qty) : null;
    const qtyNum = parsed?.success ? parsed.data : null;
    let error: string | null = null;
    if (!row.itemId) error = "Select an inventory item";
    else if (!item) error = "This item is no longer in the inventory";
    else if (row.qty.trim() === "") error = "Enter the quantity";
    else if (!parsed?.success)
      error = parsed?.error.issues[0]?.message ?? "Invalid quantity";
    else if (stockLeft && (stockLeft.get(row.itemId) ?? 0) < -1e-9)
      error = `Not enough in stock (${formatQty(item.stocks)} ${item.type} available across the selected sessions)`;
    return {
      ...row,
      item,
      qtyNum,
      cost: item && qtyNum ? round2(qtyNum * item.price) : 0,
      error,
      adjusted:
        row.source !== "manual" &&
        row.originalQty !== undefined &&
        qtyNum !== row.originalQty,
    };
  });
}

export const rowsCost = (rows: EvaluatedMaterialRow[]) =>
  round2(rows.reduce((s, r) => s + r.cost, 0));

export const validQuantities = (rows: EvaluatedMaterialRow[]): MaterialQuantity[] =>
  rows
    .filter((r) => !r.error && r.qtyNum !== null)
    .map((r) => ({ itemId: r.itemId, qty: r.qtyNum! }));

export function totalsByItem(sessions: MaterialQuantity[][]) {
  const totals = new Map<string, number>();
  for (const s of sessions)
    for (const q of s) totals.set(q.itemId, round2((totals.get(q.itemId) ?? 0) + q.qty));
  return [...totals.entries()].map(([itemId, qty]) => ({ itemId, qty }));
}

export function stockLeftAfter(
  sessions: MaterialRow[][],
  inventory: inventoryInterface[] | undefined,
) {
  const left = new Map<string, number>();
  for (const item of inventory ?? []) left.set(item._id, Number(item.stocks));
  for (const rows of sessions)
    for (const row of rows) {
      const n = Number(row.qty);
      if (!row.itemId || !Number.isFinite(n) || n <= 0) continue;
      left.set(row.itemId, round2((left.get(row.itemId) ?? 0) - n));
    }
  return left;
}

export const quantitiesKey = (sessions: MaterialQuantity[][]) =>
  JSON.stringify(sessions.map((s) => s.map((q) => [q.itemId, q.qty])));
