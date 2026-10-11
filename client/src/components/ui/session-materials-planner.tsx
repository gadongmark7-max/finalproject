"use client";

import { Info, LoaderCircle, Package, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatPesoCents } from "@/app/utils/customFunction";
import { inventoryInterface } from "@/app/types/inventory.type";
import { PlannedSessionMaterialsState } from "@/app/hooks/plannedMaterialsHooks";
import { MaterialRowsEditor } from "@/components/ui/material-rows-editor";

export function SessionMaterialsPlanner({
  state,
  inventory,
  inventoryLoading,
  sessionHours,
  showErrors,
  ownerLabel,
  isAnalyzing = false,
  aiNote,
}: {
  state: PlannedSessionMaterialsState;
  inventory: inventoryInterface[] | undefined;
  inventoryLoading: boolean;
  sessionHours: number[];
  showErrors: boolean;
  ownerLabel: string;
  isAnalyzing?: boolean;
  aiNote?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs leading-relaxed text-text-muted">
          Estimated materials per session from{" "}
          <span className="font-medium text-text">{ownerLabel}</span>{" "}
          inventory. Costs use the stored inventory prices. Nothing is deducted
          now — actual usage is confirmed when each session is completed.
        </p>
        {state.managed && (
          <span className="border border-border-gold px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-gold">
            Artist-adjusted
          </span>
        )}
      </div>

      {aiNote && <p className="text-[11px] text-text-dim">{aiNote}</p>}

      {isAnalyzing && (
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Estimating materials…
        </p>
      )}

      {state.aiDiffers && (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-border-gold bg-surface-alt px-3 py-2">
          <p className="flex items-start gap-1.5 text-[11px] text-text-muted">
            <Sparkles className="mt-px h-3.5 w-3.5 shrink-0 text-gold" />
            The AI estimate differs from your edited list. Your edits are kept
            until you replace them.
          </p>
          <button
            type="button"
            onClick={state.applyAiEstimate}
            className="text-[11px] uppercase tracking-[0.14em] text-gold hover:underline"
          >
            Replace with AI estimate
          </button>
        </div>
      )}

      {inventoryLoading ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Loading inventory…
        </p>
      ) : (inventory?.length ?? 0) === 0 ? (
        <p className="flex items-start gap-1.5 text-xs text-text-muted">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          This inventory has no items yet.{" "}
          <Link href="/pages/artist/inventory" className="text-gold hover:underline">
            Add inventory items
          </Link>{" "}
          to estimate material costs.
        </p>
      ) : (
        <div className="space-y-3">
          {sessionHours.map((hours, index) => (
            <div key={index} className="space-y-2 border border-border bg-surface-alt p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  <Package className="h-3.5 w-3.5 text-gold" />
                  Session {index + 1}
                  {hours > 0 && (
                    <span className="text-text-dim">
                      · {hours} {hours === 1 ? "hr" : "hrs"}
                    </span>
                  )}
                </span>
                <span className="text-sm text-text">
                  {formatPesoCents(state.sessionCosts[index] ?? 0)}
                </span>
              </div>
              <MaterialRowsEditor
                rows={state.plan[index] ?? []}
                evaluated={state.evaluated[index] ?? []}
                inventory={inventory}
                onChange={(rows) => state.setSessionRows(index, rows)}
                showErrors={showErrors}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
        <span className="text-text-muted">
          Estimated material cost
          <span className="block text-[10px] uppercase tracking-[0.14em] text-text-dim">
            {state.managed
              ? "Artist-adjusted usage"
              : state.hasAi
                ? "AI-estimated usage"
                : "Planned usage"}
          </span>
        </span>
        <span className="text-gold">{formatPesoCents(state.totalCost)}</span>
      </div>
      {showErrors && !state.isValid && (
        <p className="text-[11px] text-danger-light" role="alert">
          Fix the highlighted materials before saving.
        </p>
      )}
    </div>
  );
}
