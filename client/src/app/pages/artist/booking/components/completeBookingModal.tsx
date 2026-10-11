"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  LoaderCircle,
} from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPesoCents } from "@/app/utils/customFunction";
import { bookingInterface } from "@/app/types/booking.type";
import { inventoryInterface } from "@/app/types/inventory.type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MaterialRowsEditor } from "@/components/ui/material-rows-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  evaluateRows,
  MaterialRow,
  rowsCost,
  rowsFrom,
  splitAcrossSessions,
  stockLeftAfter,
  validQuantities,
} from "@/lib/sessionMaterials";
import { amountPaid, SessionUsageList } from "./bookingCard";

export const isBookingFullyPaid = (booking: bookingInterface) =>
  Number(booking.balance) < 0.005;

export const inventoryQueryKey = (ownerId: string) => ["inventoryData", ownerId];

const round2 = (n: number) => Math.round(n * 100) / 100;

type SessionDraft = {
  session: number;
  selected: boolean;
  rows: MaterialRow[];
  noneUsed: boolean;
};

function plannedRowsFor(booking: bookingInterface): MaterialRow[][] {
  const count = booking.sessions.length;
  const planned = booking.sessionMaterials ?? [];
  if (planned.length === count) {
    return planned.map((s) =>
      rowsFrom(
        s.items.map((i) => ({ itemId: i.itemId, qty: i.qty })),
        "estimate",
      ),
    );
  }
  const legacy = (booking.itemUsed ?? []).filter((i) => i.qty > 0);
  if (legacy.length === 0) return Array.from({ length: count }, () => []);
  return splitAcrossSessions(
    legacy.map((i) => ({
      itemId: i.itemId,
      qty: i.qty,
      unit: Number.isInteger(i.qty) ? "" : "ml",
    })),
    booking.sessions,
  ).map((q) => rowsFrom(q, "estimate"));
}

function initialDrafts(booking: bookingInterface): SessionDraft[] {
  const recorded = new Set((booking.sessionUsage ?? []).map((u) => u.session));
  const planned = plannedRowsFor(booking);
  return booking.sessions.map((_, index) => {
    const session = index + 1;
    return {
      session,
      selected: !recorded.has(session),
      rows: recorded.has(session) ? [] : (planned[index] ?? []),
      noneUsed: false,
    };
  });
}

export function CompleteBookingModal({
  booking,
  setBookings,
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<SessionDraft[]>(() =>
    initialDrafts(booking),
  );
  const [reason, setReason] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);
  const queryClient = useQueryClient();

  const owner = booking.bussiness ?? booking.artist;
  const inventoryQuery = useQuery({
    queryKey: inventoryQueryKey(owner._id),
    queryFn: async (): Promise<inventoryInterface[]> =>
      (await axiosInstance.get(`/inventory/${owner._id}`)).data,
    enabled: open,
  });
  const inventory = inventoryQuery.data;

  const usage = booking.sessionUsage ?? [];
  const recordedSessions = new Set(usage.map((u) => u.session));
  const planned = booking.sessions.length;
  const fullyPaid = isBookingFullyPaid(booking);
  const isBusinessInventory = !!booking.bussiness;

  const selected = drafts.filter(
    (d) => d.selected && !recordedSessions.has(d.session),
  );
  const stockLeft = useMemo(
    () => stockLeftAfter(selected.map((d) => d.rows), inventory),
    [selected, inventory],
  );
  const evaluated = useMemo(
    () =>
      new Map(
        drafts.map((d) => [d.session, evaluateRows(d.rows, inventory, stockLeft)]),
      ),
    [drafts, inventory, stockLeft],
  );

  const performedCount = recordedSessions.size + selected.length;
  const closeEarly = performedCount < planned;
  const blockedByBalance = !closeEarly && !fullyPaid;
  const recordedCost = round2(usage.reduce((s, u) => s + Number(u.totalCost || 0), 0));
  const selectedCost = round2(
    selected.reduce((s, d) => s + rowsCost(evaluated.get(d.session) ?? []), 0),
  );

  const sessionProblem = (d: SessionDraft) => {
    const rows = evaluated.get(d.session) ?? [];
    if (rows.some((r) => r.error)) return "Fix the materials for this session";
    if (rows.length === 0 && !d.noneUsed)
      return "Add the materials used, or confirm none were used";
    return null;
  };
  const problems = selected.map(sessionProblem).filter(Boolean);
  const canSubmit =
    performedCount >= 1 &&
    !blockedByBalance &&
    problems.length === 0 &&
    !inventoryQuery.isLoading;

  const update = (session: number, patch: Partial<SessionDraft>) =>
    setDrafts((prev) =>
      prev.map((d) => (d.session === session ? { ...d, ...patch } : d)),
    );

  const mutation = useMutation({
    mutationFn: () =>
      axiosInstance.put<bookingInterface[]>(`/booking/status`, {
        id: booking._id,
        status: "completed",
        sessions: selected.map((d) => ({
          session: d.session,
          materials: validQuantities(evaluated.get(d.session) ?? []),
        })),
        closeEarly,
        reason: closeEarly && reason.trim() ? reason.trim() : undefined,
      }),
    onSuccess: ({ data }) => {
      setBookings(data);
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey(owner._id) });
      queryClient.invalidateQueries({ queryKey: ["inventoryData"] });
      setOpen(false);
      const updated = data.find((b) => b._id === booking._id);
      const total = (updated?.sessionUsage ?? []).reduce(
        (sum, u) => sum + Number(u.totalCost || 0),
        0,
      );
      successAlert(
        updated?.closure
          ? `booking closed after ${updated.closure.sessionsPerformed} of ${updated.closure.plannedSessions} sessions`
          : total > 0
            ? `completed · ${formatPesoCents(total)} materials recorded`
            : "booking completed",
      );
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not complete this booking")),
  });

  const submit = () => {
    setTriedSubmit(true);
    if (!canSubmit || mutation.isPending) return;
    mutation.mutate();
  };

  const triggerLabel = fullyPaid ? "Mark as Complete" : "Complete or close early";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (mutation.isPending) return;
        setOpen(v);
        if (v) {
          setDrafts(initialDrafts(booking));
          setReason("");
          setTriedSubmit(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {fullyPaid ? (
          <Button hoverText={triggerLabel} aria-label={triggerLabel}>
            <Check className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <Check className="h-3.5 w-3.5" />
            Complete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {closeEarly ? "Close booking early" : "Complete booking"}
          </DialogTitle>
          <DialogDescription>
            {booking.client.name} · {planned}{" "}
            {planned === 1 ? "session" : "sessions"} planned. Tick the sessions
            that were actually performed and confirm the materials used in each.
          </DialogDescription>
        </DialogHeader>

        {inventoryQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading inventory…
          </p>
        ) : (
          <div className="space-y-3">
            {drafts.map((d) => {
              const recorded = recordedSessions.has(d.session);
              const rows = evaluated.get(d.session) ?? [];
              const problem =
                d.selected && !recorded ? sessionProblem(d) : null;
              const recordedUsage = usage.filter((u) => u.session === d.session);
              return (
                <section
                  key={d.session}
                  className={`border p-3 transition-colors ${
                    recorded || d.selected
                      ? "border-border-gold bg-surface-alt"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      className={`flex items-center gap-2.5 text-sm ${recorded ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={recorded || d.selected}
                        disabled={recorded || mutation.isPending}
                        onChange={(e) =>
                          update(d.session, { selected: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#C6A55C]"
                      />
                      <span className="text-text">Session {d.session}</span>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
                        {booking.sessions[d.session - 1]}h
                        {d.session > booking.session && !recorded
                          ? " · not scheduled yet"
                          : d.session === booking.session && !recorded
                            ? " · current"
                            : ""}
                      </span>
                    </label>
                    <span className="text-sm text-text">
                      {recorded
                        ? formatPesoCents(
                            recordedUsage.reduce((s, u) => s + u.totalCost, 0),
                          )
                        : d.selected
                          ? formatPesoCents(rowsCost(rows))
                          : "—"}
                    </span>
                  </div>

                  {recorded ? (
                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-1.5 text-[11px] text-success-light">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Already recorded — these materials were deducted.
                      </p>
                      <SessionUsageList usage={recordedUsage} />
                    </div>
                  ) : d.selected ? (
                    <div className="mt-3 space-y-2">
                      {rows.some((r) => r.source === "estimate") && (
                        <p className="text-[11px] text-text-dim">
                          Pre-filled from the planned estimate. Adjust to the
                          quantities actually used.
                        </p>
                      )}
                      <MaterialRowsEditor
                        rows={d.rows}
                        evaluated={rows}
                        inventory={inventory}
                        onChange={(next) =>
                          update(d.session, {
                            rows: next,
                            noneUsed: next.length > 0 ? false : d.noneUsed,
                          })
                        }
                        showErrors={triedSubmit}
                        showStock
                        disabled={mutation.isPending}
                        emptyText="No materials listed for this session yet."
                      />
                      {d.rows.length === 0 && (
                        <label className="flex cursor-pointer items-start gap-2 text-xs text-text-muted">
                          <input
                            type="checkbox"
                            checked={d.noneUsed}
                            onChange={(e) =>
                              update(d.session, { noneUsed: e.target.checked })
                            }
                            className="mt-0.5 accent-[#C6A55C]"
                          />
                          No inventory materials were used in this session
                        </label>
                      )}
                      {problem && triedSubmit && (
                        <p className="text-[11px] text-danger-light" role="alert">
                          {problem}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-text-muted">
                      Not performed — nothing is deducted or expensed for this
                      session.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <section className="space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-text-muted">
              Materials to deduct now ({selected.length}{" "}
              {selected.length === 1 ? "session" : "sessions"})
            </span>
            <span className="text-gold">{formatPesoCents(selectedCost)}</span>
          </div>
          {recordedCost > 0 && (
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <span className="text-text-muted">Already recorded earlier</span>
              <span className="text-text">{formatPesoCents(recordedCost)}</span>
            </div>
          )}
          <p className="flex items-start gap-1.5 text-[11px] text-text-dim">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            {isBusinessInventory
              ? "Deducted from the studio's inventory using stored prices. Studio stock purchases are already business expenses, so no expense is added."
              : "Deducted from your inventory, and the cost (from stored prices) is added to your expenses. Recorded usage can't be edited afterwards."}
          </p>
        </section>

        <section className="space-y-1.5 border border-border p-3 text-xs">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-text-muted">Paid so far</span>
            <span className="text-text">{formatPesoCents(amountPaid(booking))}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-text-muted">Remaining balance</span>
            <span className="text-text">{formatPesoCents(Math.max(0, booking.balance))}</span>
          </div>
          <p className="text-[11px] text-text-dim">
            Completing doesn&apos;t change payments. Collect balances or process
            refunds separately.
          </p>
        </section>

        {performedCount < 1 && (
          <p className="flex items-start gap-1.5 text-[11px] text-danger-light" role="alert">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            Select at least one session that was performed.
          </p>
        )}

        {closeEarly && performedCount >= 1 && (
          <div className="space-y-2 border border-border p-3">
            <p className="text-sm text-text">
              Closing after {performedCount} of {planned} planned sessions.
            </p>
            <ul className="space-y-1 text-xs text-text-muted">
              {!fullyPaid && (
                <li>
                  The remaining {formatPesoCents(booking.balance)} stays unpaid —
                  it isn&apos;t marked as paid or charged for sessions that
                  didn&apos;t happen.
                </li>
              )}
              <li>Unticked sessions are not recorded and deduct nothing.</li>
            </ul>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              placeholder="Reason (optional), e.g. client chose not to continue"
              className="min-h-16"
            />
          </div>
        )}

        {blockedByBalance && (
          <p className="flex items-start gap-1.5 text-[11px] text-danger-light" role="alert">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            All planned sessions are selected. Collect the remaining balance of{" "}
            {formatPesoCents(booking.balance)} before completing, or untick the
            sessions that weren&apos;t performed.
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              mutation.isPending ||
              performedCount < 1 ||
              blockedByBalance ||
              inventoryQuery.isLoading ||
              (triedSubmit && !canSubmit)
            }
          >
            {mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {closeEarly ? "Close booking" : "Complete booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
