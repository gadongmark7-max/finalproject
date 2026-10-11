"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inventoryInterface } from "@/app/types/inventory.type";
import { aiAnalysisMaterialInterface } from "@/app/types/aiAnalysis.type";
import {
  evaluateRows,
  MaterialQuantity,
  MaterialRow,
  quantitiesKey,
  rowsCost,
  rowsFrom,
  splitAcrossSessions,
  totalsByItem,
  validQuantities,
} from "@/lib/sessionMaterials";

const resize = (plan: MaterialRow[][], count: number) =>
  Array.from({ length: count }, (_, i) => plan[i] ?? []);

export function usePlannedSessionMaterials({
  sessionHours,
  inventory,
  aiMaterials,
}: {
  sessionHours: number[];
  inventory: inventoryInterface[] | undefined;
  aiMaterials: aiAnalysisMaterialInterface[] | null;
}) {
  const [plan, setPlan] = useState<MaterialRow[][]>([[]]);
  const [managed, setManaged] = useState(false);

  const aiSplit = useMemo<MaterialQuantity[][] | null>(
    () =>
      aiMaterials
        ? splitAcrossSessions(
            aiMaterials.map((m) => ({
              itemId: m.inventoryItemId,
              qty: m.estimatedQuantity,
              unit: m.unit,
            })),
            sessionHours,
          )
        : null,
    [aiMaterials, sessionHours],
  );
  const aiKey = aiSplit ? quantitiesKey(aiSplit) : null;
  const hoursKey = sessionHours.join(",");
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!managed && aiSplit) {
      if (applied.current === aiKey) return;
      applied.current = aiKey;
      setPlan(aiSplit.map((q) => rowsFrom(q, "ai")));
      return;
    }
    setPlan((prev) =>
      prev.length === sessionHours.length ? prev : resize(prev, sessionHours.length),
    );
  }, [aiKey, hoursKey, managed]);

  const evaluated = useMemo(
    () => plan.map((rows) => evaluateRows(rows, inventory)),
    [plan, inventory],
  );
  const quantities = useMemo(() => evaluated.map(validQuantities), [evaluated]);
  const totals = useMemo(() => totalsByItem(quantities), [quantities]);
  const sessionCosts = evaluated.map(rowsCost);
  const totalCost =
    Math.round(sessionCosts.reduce((s, c) => s + c, 0) * 100) / 100;
  const isValid = evaluated.every((rows) => rows.every((r) => !r.error));

  const aiTotalsKey = aiSplit ? JSON.stringify(totalsByItem(aiSplit)) : null;
  const aiDiffers =
    managed && !!aiSplit && aiTotalsKey !== JSON.stringify(totals);

  const setSessionRows = (index: number, rows: MaterialRow[]) => {
    setManaged(true);
    setPlan((prev) => resize(prev, sessionHours.length).map((r, i) => (i === index ? rows : r)));
  };

  const applyAiEstimate = () => {
    applied.current = null;
    setManaged(false);
  };

  const removeSessionAt = (index: number) =>
    setPlan((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    applied.current = null;
    setManaged(false);
    setPlan(resize([], sessionHours.length));
  };

  const overrides = managed
    ? totals.map((t) => ({ inventoryItemId: t.itemId, quantity: t.qty }))
    : null;

  const itemUsed = totals.map((t) => ({
    itemId: t.itemId,
    item: inventory?.find((i) => i._id === t.itemId)?.item ?? "",
    qty: t.qty,
    price: inventory?.find((i) => i._id === t.itemId)?.price ?? 0,
  }));

  return {
    plan,
    evaluated,
    sessionCosts,
    totalCost,
    isValid,
    managed,
    aiDiffers,
    hasAi: !!aiSplit,
    overrides,
    overridesKey: overrides ? JSON.stringify(overrides) : null,
    payload: quantities,
    itemUsed,
    setSessionRows,
    applyAiEstimate,
    removeSessionAt,
    reset,
  };
}

export type PlannedSessionMaterialsState = ReturnType<
  typeof usePlannedSessionMaterials
>;
