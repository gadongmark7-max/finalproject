"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Ban, LoaderCircle } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
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
import { amountPaid } from "./bookingCard";

export function CancelBookingModal({
  booking,
  setBookings,
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const paid = amountPaid(booking);
  const recordedSessions = booking.sessionUsage?.length ?? 0;

  const mutation = useMutation({
    mutationFn: () =>
      axiosInstance.put<bookingInterface[]>(`/booking/status`, {
        id: booking._id,
        status: "cancelled",
        reason: trimmed,
      }),
    onSuccess: ({ data }) => {
      setBookings(data);
      setOpen(false);
      setReason("");
      successAlert("booking cancelled");
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not cancel this booking")),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !mutation.isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Ban className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription>
            {booking.client.name} · {booking.date}. The client will be
            notified.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-1 text-xs text-text-muted">
          <li>No inventory is deducted and no expense or income is created.</li>
          {paid > 0 ? (
            <li>
              {formatPesoCents(paid)} already paid stays recorded. Cancelling
              is not a refund — use Refund in the Cancelled tab if the client
              should get the money back.
            </li>
          ) : (
            <li>No payment has been recorded for this booking.</li>
          )}
          {recordedSessions > 0 && (
            <li>
              Materials already recorded for {recordedSessions}{" "}
              {recordedSessions === 1 ? "session" : "sessions"} stay deducted
              and expensed.
            </li>
          )}
        </ul>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          placeholder="Reason for cancelling"
          aria-label="Reason for cancelling"
          className="min-h-20"
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Keep booking
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || trimmed.length < 3}
          >
            {mutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
