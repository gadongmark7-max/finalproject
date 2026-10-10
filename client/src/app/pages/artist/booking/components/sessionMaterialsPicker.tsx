"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, LoaderCircle, Plus, Trash2 } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { formatPesoCents } from "@/app/utils/customFunction";
import {
  bookingInterface,
  sessionMaterialInput,
} from "@/app/types/booking.type";
import {
  inventoryInterface,
  isMeasuredUnit,
} from "@/app/types/inventory.type";
import {
  itemUsedQtySchemaFor,
  sanitizeItemUsedQty,
} from "@/lib/validation/schemas/inventory";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = { itemId: string; qty: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

export const inventoryQueryKey = (ownerId: string) => [
  "inventoryData",
  ownerId,
];

export function useSessionMaterials(booking: bookingInterface, enabled: boolean) {
  const owner = booking.bussiness ?? booking.artist;
  const [rows, setRows] = useState<Row[]>([]);
  const [noneUsed, setNoneUsed] = useState(false);

  const inventoryQuery = useQuery({
    queryKey: inventoryQueryKey(owner._id),
    queryFn: async (): Promise<inventoryInterface[]> =>
      (await axiosInstance.get(`/inventory/${owner._id}`)).data,
    enabled,
  });
  const inventory = inventoryQuery.data;

  const lines = useMemo(
    () =>
      rows.map((row) => {
        const item = inventory?.find((i) => i._id === row.itemId);
        const parsed = item
          ? itemUsedQtySchemaFor(item.type).safeParse(row.qty)
          : null;
        const qty = parsed?.success ? parsed.data : null;
        let error: string | null = null;
        if (!item) error = "This item is no longer in the inventory";
        else if (row.qty.trim() === "") error = "Enter the quantity used";
        else if (!parsed?.success)
          error = parsed?.error.issues[0]?.message ?? "Invalid quantity";
        else if (qty! > item.stocks)
          error = `Only ${item.stocks} ${item.type} in stock`;
        return {
          ...row,
          item,
          qtyNum: qty,
          cost: item && qty ? round2(qty * item.price) : 0,
          error,
        };
      }),
    [rows, inventory],
  );

  const totalCost = round2(lines.reduce((sum, l) => sum + l.cost, 0));
  const hasErrors = lines.some((l) => l.error);
  const isValid = rows.length > 0 ? !hasErrors : noneUsed;

  const payload: sessionMaterialInput[] = lines
    .filter((l) => l.qtyNum !== null)
    .map((l) => ({ itemId: l.itemId, qty: l.qtyNum! }));

  const addItem = (itemId: string) => {
    if (!itemId || rows.some((r) => r.itemId === itemId)) return;
    setRows((prev) => [...prev, { itemId, qty: "" }]);
    setNoneUsed(false);
  };
  const setQty = (itemId: string, qty: string) =>
    setRows((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, qty } : r)));
  const removeItem = (itemId: string) =>
    setRows((prev) => prev.filter((r) => r.itemId !== itemId));
  const reset = () => {
    setRows([]);
    setNoneUsed(false);
  };

  return {
    owner,
    inventory,
    isLoading: inventoryQuery.isLoading,
    lines,
    rows,
    noneUsed,
    setNoneUsed,
    totalCost,
    isValid,
    payload,
    addItem,
    setQty,
    removeItem,
    reset,
  };
}

export type SessionMaterialsState = ReturnType<typeof useSessionMaterials>;

export function SessionMaterialsPicker({
  booking,
  state,
}: {
  booking: bookingInterface;
  state: SessionMaterialsState;
}) {
  const {
    inventory,
    isLoading,
    lines,
    rows,
    noneUsed,
    setNoneUsed,
    totalCost,
    addItem,
    setQty,
    removeItem,
  } = state;
  const isBusinessInventory = !!booking.bussiness;

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <LoaderCircle className="h-4 w-4 animate-spin" /> Loading inventory…
      </p>
    );
  }

  const available = (inventory ?? []).filter(
    (i) => i.stocks > 0 && !rows.some((r) => r.itemId === i._id),
  );
  const planned = booking.itemUsed.filter((p) =>
    available.some((i) => i._id === p.itemId),
  );

  return (
    <div className="space-y-3">
      <Select value="" onValueChange={addItem}>
        <SelectTrigger className="w-full" aria-label="Add a material">
          <SelectValue
            placeholder={
              available.length
                ? "Add a material used in this session"
                : "No items in stock"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {available.map((i) => (
            <SelectItem key={i._id} value={i._id}>
              {i.item} · {i.stocks} {i.type} left
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {planned.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
            Planned for this tattoo:
          </span>
          {planned.map((p) => (
            <button
              key={p.itemId}
              type="button"
              onClick={() => addItem(p.itemId)}
              className="inline-flex max-w-full items-center gap-1 border border-border px-2 py-0.5 text-[11px] text-text-muted transition-colors hover:border-border-gold hover:text-text"
            >
              <Plus className="h-3 w-3 shrink-0" />
              <span className="truncate">{p.item}</span>
            </button>
          ))}
        </div>
      )}

      {lines.length > 0 && (
        <ul className="divide-y divide-border border border-border">
          {lines.map((l) => (
            <li key={l.itemId} className="space-y-1.5 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm text-text">
                    {l.item?.item ?? "Removed item"}
                  </p>
                  {l.item && (
                    <p className="text-[11px] text-text-dim">
                      {l.item.stocks} {l.item.type} in stock ·{" "}
                      {formatPesoCents(l.item.price)} / {l.item.type}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(l.itemId)}
                  aria-label={`Remove ${l.item?.item ?? "item"}`}
                  className="shrink-0 p-1 text-text-muted transition-colors hover:text-danger-light"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Input
                    value={l.qty}
                    inputMode={
                      isMeasuredUnit(l.item?.type ?? "") ? "decimal" : "numeric"
                    }
                    onChange={(e) =>
                      setQty(
                        l.itemId,
                        sanitizeItemUsedQty(e.target.value, l.item?.type ?? ""),
                      )
                    }
                    placeholder="Qty used"
                    aria-invalid={!!l.error && l.qty !== ""}
                    aria-label={`Quantity of ${l.item?.item ?? "item"} used`}
                    className="h-9 min-w-0 max-w-[9rem]"
                  />
                  <span className="text-xs text-text-muted">
                    {l.item?.type}
                  </span>
                </div>
                <span className="ml-auto whitespace-nowrap text-sm text-text">
                  {formatPesoCents(l.cost)}
                </span>
              </div>
              {l.error && l.qty !== "" && (
                <p className="text-[11px] text-danger-light" role="alert">
                  {l.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {rows.length === 0 && (
        <label className="flex cursor-pointer items-start gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={noneUsed}
            onChange={(e) => setNoneUsed(e.target.checked)}
            className="mt-0.5 accent-[#C6A55C]"
          />
          No inventory materials were used in this session
        </label>
      )}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-sm">
          <span className="text-text-muted">Estimated material cost</span>
          <span className="text-gold">{formatPesoCents(totalCost)}</span>
        </div>
      )}

      {rows.length > 0 ? (
        <p className="flex items-start gap-1.5 text-[11px] text-text-dim">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          {isBusinessInventory
            ? "Only these quantities are deducted from the studio's inventory. Studio stock purchases are already business expenses, so no expense is added."
            : "Only these quantities are deducted from your inventory, and their cost (from your stored prices) is added to your expenses. Recorded usage can't be edited afterwards."}
        </p>
      ) : (
        noneUsed && (
          <p className="text-[11px] text-text-dim">
            Nothing will be deducted and no expense will be created.
          </p>
        )
      )}
    </div>
  );
}
