"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { formatPesoCents } from "@/app/utils/customFunction";
import {
  inventoryInterface,
  quantityInputMode,
} from "@/app/types/inventory.type";
import { sanitizeItemUsedQty } from "@/lib/validation/schemas/inventory";
import {
  emptyRow,
  EvaluatedMaterialRow,
  formatQty,
  MaterialRow,
} from "@/lib/sessionMaterials";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOURCE_BADGE: Record<string, string> = {
  ai: "AI estimate",
  estimate: "Planned",
};

function RowBadge({ row }: { row: EvaluatedMaterialRow }) {
  if (row.source === "manual") {
    return (
      <span className="border border-border px-1.5 py-px text-[9px] uppercase tracking-[0.12em] text-text-dim">
        Added
      </span>
    );
  }
  if (row.adjusted) {
    return (
      <span className="border border-border-gold px-1.5 py-px text-[9px] uppercase tracking-[0.12em] text-gold">
        Adjusted
        {row.originalQty !== undefined &&
          ` · was ${formatQty(row.originalQty)}`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 border border-border px-1.5 py-px text-[9px] uppercase tracking-[0.12em] text-text-muted">
      {row.source === "ai" && <Sparkles className="h-2.5 w-2.5 text-gold" />}
      {SOURCE_BADGE[row.source] ?? row.source}
    </span>
  );
}

export function MaterialRowsEditor({
  rows,
  evaluated,
  inventory,
  onChange,
  showErrors,
  showStock = false,
  emptyText = "No materials listed for this session.",
  addLabel = "Add material",
  disabled = false,
}: {
  rows: MaterialRow[];
  evaluated: EvaluatedMaterialRow[];
  inventory: inventoryInterface[] | undefined;
  onChange: (rows: MaterialRow[]) => void;
  showErrors: boolean;
  showStock?: boolean;
  emptyText?: string;
  addLabel?: string;
  disabled?: boolean;
}) {
  const update = (key: string, patch: Partial<MaterialRow>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) => onChange(rows.filter((r) => r.key !== key));
  const add = () => onChange([...rows, emptyRow()]);

  return (
    <div className="space-y-2">
      {evaluated.length === 0 ? (
        <p className="text-xs text-text-muted">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {evaluated.map((row) => {
            const taken = new Set(
              rows.filter((r) => r.key !== row.key).map((r) => r.itemId),
            );
            const options = (inventory ?? []).filter(
              (i) => i._id === row.itemId || !taken.has(i._id),
            );
            const unit = row.item?.type ?? "";
            return (
              <li key={row.key} className="space-y-2 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Select
                      value={row.itemId || undefined}
                      onValueChange={(itemId) =>
                        update(row.key, { itemId, qty: row.itemId === itemId ? row.qty : "" })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger
                        className="min-h-11 w-full whitespace-normal text-left data-[size=default]:h-auto *:data-[slot=select-value]:line-clamp-2"
                        aria-label="Inventory item"
                        aria-invalid={showErrors && !row.itemId}
                      >
                        <SelectValue placeholder="Select inventory item" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((i) => (
                          <SelectItem key={i._id} value={i._id}>
                            {i.item} · {formatPesoCents(i.price)}/{i.type}
                            {showStock && ` · ${formatQty(i.stocks)} left`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RowBadge row={row} />
                      {row.item && (
                        <span className="text-[11px] text-text-dim">
                          {formatPesoCents(row.item.price)} / {row.item.type}
                          {showStock &&
                            ` · ${formatQty(row.item.stocks)} ${row.item.type} in stock`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(row.key)}
                    disabled={disabled}
                    aria-label={`Remove ${row.item?.item ?? "material"}`}
                    className="shrink-0 p-1.5 text-text-muted transition-colors hover:text-danger-light disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={row.qty}
                    inputMode={quantityInputMode(unit)}
                    onChange={(e) =>
                      update(row.key, {
                        qty: sanitizeItemUsedQty(e.target.value, unit),
                      })
                    }
                    disabled={disabled || !row.itemId}
                    placeholder="Qty"
                    aria-label={`Quantity of ${row.item?.item ?? "material"}`}
                    aria-invalid={showErrors && !!row.error}
                    className="h-9 w-28 min-w-0"
                  />
                  <span className="text-xs text-text-muted">{unit}</span>
                  <span className="ml-auto whitespace-nowrap text-sm text-text">
                    {formatPesoCents(row.cost)}
                  </span>
                </div>
                {row.error && (showErrors || (row.qty !== "" && row.itemId)) && (
                  <p className="text-[11px] text-danger-light" role="alert">
                    {row.error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        disabled={disabled || (inventory?.length ?? 0) === 0}
        className="inline-flex items-center gap-1.5 border border-dashed border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:border-border-gold hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
