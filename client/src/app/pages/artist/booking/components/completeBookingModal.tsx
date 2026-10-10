"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, LoaderCircle, LogOut } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPesoCents } from "@/app/utils/customFunction";
import { bookingInterface } from "@/app/types/booking.type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  inventoryQueryKey,
  SessionMaterialsPicker,
  useSessionMaterials,
} from "./sessionMaterialsPicker";
import { amountPaid, isSessionRecorded, SessionUsageList } from "./bookingCard";

export const isBookingFullyPaid = (booking: bookingInterface) =>
  Number(booking.balance) < 0.005;

export const canCloseBooking = (booking: bookingInterface) =>
  isBookingFullyPaid(booking) ||
  booking.session < booking.sessions.length ||
  (booking.session > 1 && !isSessionRecorded(booking, booking.session));

export function CompleteBookingModal({
  booking,
  setBookings,
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [performed, setPerformed] = useState(true);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const recorded = isSessionRecorded(booking, booking.session);
  const materials = useSessionMaterials(booking, open && !recorded);
  const fullyPaid = isBookingFullyPaid(booking);
  const planned = booking.sessions.length;
  const canSkipCurrent = !recorded && booking.session > 1;
  const currentPerformed = recorded || performed || !canSkipCurrent;
  const performedCount = currentPerformed
    ? booking.session
    : booking.session - 1;
  const closeEarly = performedCount < planned;
  const blockedByBalance = !closeEarly && !fullyPaid;
  const recordNow = !recorded && currentPerformed;
  const materialsReady = !recordNow || materials.isValid;

  const mutation = useMutation({
    mutationFn: () =>
      axiosInstance.put<bookingInterface[]>(`/booking/status`, {
        id: booking._id,
        status: "completed",
        materials: recordNow ? materials.payload : undefined,
        closeEarly,
        reason: closeEarly && reason.trim() ? reason.trim() : undefined,
      }),
    onSuccess: ({ data }) => {
      setBookings(data);
      if (recordNow) {
        queryClient.invalidateQueries({
          queryKey: inventoryQueryKey(materials.owner._id),
        });
      }
      setOpen(false);
      materials.reset();
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

  const triggerLabel = fullyPaid ? "Mark as Complete" : "Close Booking Early";

  return (
    <Dialog open={open} onOpenChange={(v) => !mutation.isPending && setOpen(v)}>
      <DialogTrigger asChild>
        {fullyPaid ? (
          <Button hoverText={triggerLabel} aria-label={triggerLabel}>
            <Check className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <LogOut className="h-3.5 w-3.5" />
            Close early
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {closeEarly ? "Close booking early" : "Complete booking"}
          </DialogTitle>
          <DialogDescription>
            {booking.client.name} · session {booking.session} of {planned}.
          </DialogDescription>
        </DialogHeader>

        {canSkipCurrent && (
          <div className="space-y-2">
            <p className="text-sm text-text">
              Was session {booking.session} performed?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setPerformed(value)}
                  className={`border px-3 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                    performed === value
                      ? "border-gold bg-surface-alt text-gold"
                      : "border-border text-text-muted hover:border-border-gold"
                  }`}
                >
                  {value ? "Yes, it was done" : "No, client stopped"}
                </button>
              ))}
            </div>
          </div>
        )}

        {recorded ? (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
              Already recorded
            </p>
            <SessionUsageList
              usage={(booking.sessionUsage ?? []).filter(
                (u) => u.session === booking.session,
              )}
            />
          </div>
        ) : currentPerformed ? (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
              Materials used in session {booking.session}
            </p>
            <SessionMaterialsPicker booking={booking} state={materials} />
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Session {booking.session} won&apos;t be recorded and no materials
            will be deducted for it.
          </p>
        )}

        {closeEarly && !blockedByBalance && (
          <div className="space-y-2 border border-border p-3">
            <p className="text-sm text-text">
              Closing after {performedCount} of {planned} planned sessions.
            </p>
            <ul className="space-y-1 text-xs text-text-muted">
              <li>
                Paid so far: {formatPesoCents(amountPaid(booking))} — kept as
                recorded.
              </li>
              {!fullyPaid && (
                <li>
                  Remaining {formatPesoCents(booking.balance)} is not marked as
                  paid and won&apos;t be charged for the sessions that
                  didn&apos;t happen.
                </li>
              )}
              <li>
                Materials for the remaining sessions are not deducted.
              </li>
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
          <p
            className="flex items-start gap-1.5 text-[11px] text-danger-light"
            role="alert"
          >
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            All planned sessions are done. Collect the remaining balance of{" "}
            {formatPesoCents(booking.balance)} before completing.
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
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              blockedByBalance ||
              (recordNow && materials.isLoading) ||
              !materialsReady
            }
          >
            {mutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            {closeEarly ? "Close booking" : "Complete booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
