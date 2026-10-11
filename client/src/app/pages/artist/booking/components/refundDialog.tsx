"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  LoaderCircle,
  RotateCw,
} from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPesoCents } from "@/app/utils/customFunction";
import {
  bookingInterface,
  bookingRefundOutcomeInterface,
  bookingRefundSummaryInterface,
  RefundRecordStatus,
} from "@/app/types/booking.type";
import {
  cancellationReasonLabel,
  REFUND_METHOD_LABELS,
  RefundMethod,
} from "@/lib/validation/schemas/booking";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const refundSummaryKey = (bookingId: string) => ["booking_refund", bookingId];

const STATUS_LABEL: Record<RefundRecordStatus, string> = {
  pending: "Processing",
  completed: "Refunded",
  failed: "Failed",
};

const STATUS_CLASS: Record<RefundRecordStatus, string> = {
  pending: "text-warning-light",
  completed: "text-success-light",
  failed: "text-danger-light",
};

const PAYMENT_METHOD_LABEL: Record<RefundMethod, string> = {
  cash: "Counter / cash",
  online: "Online (PayMongo)",
};

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span
        className={`text-right ${emphasis ? "text-sm text-gold" : "text-xs text-text"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function RefundDialog({
  booking,
  setBookings,
  trigger = "full",
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
  trigger?: "full" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: refundSummaryKey(booking._id),
    queryFn: async () =>
      (
        await axiosInstance.get<bookingRefundSummaryInterface>(
          `/booking/${booking._id}/refund`,
        )
      ).data,
    enabled: open,
    refetchInterval: (query) =>
      (query.state.data?.totals.pending ?? 0) > 0 ? 15000 : false,
  });
  const summary = summaryQuery.data;

  const mutation = useMutation({
    mutationFn: (method: RefundMethod) =>
      axiosInstance.post<{
        alreadyRefunded: boolean;
        outcomes: bookingRefundOutcomeInterface[];
        summary: bookingRefundSummaryInterface;
        bookings: bookingInterface[];
      }>(`/booking/${booking._id}/refund`, { method }),
    onSuccess: ({ data }) => {
      setBookings(data.bookings);
      queryClient.setQueryData(refundSummaryKey(booking._id), data.summary);
      setCashConfirmed(false);
      const failed = data.outcomes.filter((o) => o.status === "failed");
      const pending = data.outcomes.filter((o) => o.status === "pending");
      const completed = data.outcomes.filter((o) => o.status === "completed");
      if (data.alreadyRefunded) {
        successAlert("This booking was already refunded");
      } else if (failed.length > 0) {
        errorAlert(
          failed.map((o) => o.message ?? "Refund failed").join("\n"),
        );
      } else if (pending.length > 0) {
        successAlert(
          "PayMongo accepted the refund. It will show as refunded once PayMongo confirms it.",
        );
      } else if (completed.length > 0) {
        successAlert(
          `${formatPesoCents(completed.reduce((s, o) => s + o.amount, 0))} refund recorded`,
        );
      }
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not process the refund")),
  });

  const cancellation = booking.cancellation;
  const reasonLabel = cancellationReasonLabel(cancellation?.reasonCode);
  const requested = cancellation?.requestedRefundMethod ?? null;
  const totals = summary?.totals;
  const busy = mutation.isPending;
  const openOnlineInCash =
    !!totals && totals.onlineRefundable > 0 && totals.refundable > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (busy) return;
        setOpen(v);
        if (!v) setCashConfirmed(false);
      }}
    >
      <DialogTrigger asChild>
        {trigger === "icon" ? (
          <Button hoverText="Refund" aria-label="Refund">
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <RotateCw className="h-3.5 w-3.5" />
            Review refund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Refund review</DialogTitle>
          <DialogDescription>
            {booking.client.name} · {booking.date}
          </DialogDescription>
        </DialogHeader>

        {cancellation && (
          <section className="space-y-1.5 border border-border p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
              Cancellation
            </p>
            <SummaryRow
              label="Cancelled by"
              value={`${cancellation.cancelledBy}${cancellation.cancelledByRole ? ` (${cancellation.cancelledByRole})` : ""}`}
            />
            <SummaryRow
              label="Reason"
              value={reasonLabel ?? (cancellation.reason || "—")}
            />
            {cancellation.reasonDetails && (
              <p className="break-words text-xs text-text-muted">
                “{cancellation.reasonDetails}”
              </p>
            )}
            <SummaryRow
              label="Requested refund method"
              value={requested ? REFUND_METHOD_LABELS[requested] : "None"}
            />
          </section>
        )}

        {summaryQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading payments…
          </p>
        ) : summaryQuery.isError || !summary || !totals ? (
          <p className="text-sm text-danger-light" role="alert">
            {apiErrorMessage(summaryQuery.error, "Could not load the payments")}
          </p>
        ) : (
          <>
            <section className="space-y-1.5">
              <SummaryRow label="Amount paid" value={formatPesoCents(totals.paid)} />
              <SummaryRow
                label="Already refunded"
                value={formatPesoCents(totals.refunded)}
              />
              {totals.pending > 0 && (
                <SummaryRow
                  label="Refund processing (PayMongo)"
                  value={formatPesoCents(totals.pending)}
                />
              )}
              <SummaryRow
                label="Eligible for refund"
                value={formatPesoCents(totals.refundable)}
                emphasis
              />
            </section>

            {summary.payments.length > 0 && (
              <section className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                  Payments
                </p>
                <ul className="divide-y divide-border border border-border">
                  {summary.payments.map((p) => (
                    <li key={p._id} className="space-y-0.5 px-3 py-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-x-3">
                        <span className="text-text">
                          {formatPesoCents(p.amount)} ·{" "}
                          {PAYMENT_METHOD_LABEL[p.method]}
                        </span>
                        <span
                          className={
                            p.refund
                              ? STATUS_CLASS[p.refund.status]
                              : "text-text-muted"
                          }
                        >
                          {p.refund
                            ? `${STATUS_LABEL[p.refund.status]} · ${p.refund.method === "cash" ? "cash" : "PayMongo"}`
                            : "Not refunded"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim">
                        Paid {p.date} {p.time}
                        {p.refund?.status === "completed" &&
                          ` · refunded ${p.refund.date}`}
                      </p>
                      {p.refund?.status === "failed" && p.refund.failureReason && (
                        <p className="text-[11px] text-danger-light">
                          {p.refund.failureReason}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!summary.canRefund && summary.status !== "refund" && (
              <p className="text-xs text-text-muted">
                A {summary.status} booking can&apos;t be refunded.
              </p>
            )}

            {summary.canRefund && totals.refundable > 0 && (
              <section className="space-y-3 border-t border-border pt-3">
                {totals.onlineRefundable > 0 && (
                  <div className="space-y-1.5">
                    <Button
                      className="w-full"
                      onClick={() => mutation.mutate("online")}
                      disabled={busy}
                    >
                      {busy && mutation.variables === "online" ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Refund {formatPesoCents(totals.onlineRefundable)} through
                      PayMongo
                    </Button>
                    <p className="text-[11px] text-text-dim">
                      Sent to the client&apos;s original payment method. It is
                      marked refunded only after PayMongo confirms it.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="flex cursor-pointer items-start gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={cashConfirmed}
                      onChange={(e) => setCashConfirmed(e.target.checked)}
                      className="mt-0.5 accent-[#C6A55C]"
                    />
                    I handed {formatPesoCents(totals.refundable)} in cash to the
                    client.
                  </label>
                  {openOnlineInCash && (
                    <p className="flex items-start gap-1.5 text-[11px] text-warning-light">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                      This also records the online payment as refunded in cash.
                      PayMongo won&apos;t be contacted.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => mutation.mutate("cash")}
                    disabled={busy || !cashConfirmed}
                  >
                    {busy && mutation.variables === "cash" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Banknote className="h-4 w-4" />
                    )}
                    Record cash refund of {formatPesoCents(totals.refundable)}
                  </Button>
                </div>
              </section>
            )}

            {totals.refundable <= 0 && totals.pending <= 0 && totals.paid > 0 && (
              <p className="text-xs text-success-light">
                All payments for this booking have been refunded.
              </p>
            )}
            {totals.paid <= 0 && (
              <p className="text-xs text-text-muted">
                No payment was recorded for this booking, so there is nothing to
                refund.
              </p>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
