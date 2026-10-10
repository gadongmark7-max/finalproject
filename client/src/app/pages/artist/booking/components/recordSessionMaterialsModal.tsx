"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Package } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPesoCents } from "@/app/utils/customFunction";
import { bookingInterface } from "@/app/types/booking.type";
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
import {
  inventoryQueryKey,
  SessionMaterialsPicker,
  useSessionMaterials,
} from "./sessionMaterialsPicker";

export function RecordSessionMaterialsModal({
  booking,
  setBookings,
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const materials = useSessionMaterials(booking, open);

  const mutation = useMutation({
    mutationFn: () =>
      axiosInstance.post<{
        alreadyRecorded: boolean;
        bookings: bookingInterface[];
      }>(`/booking/${booking._id}/session-materials`, {
        session: booking.session,
        materials: materials.payload,
      }),
    onSuccess: ({ data }) => {
      setBookings(data.bookings);
      queryClient.invalidateQueries({
        queryKey: inventoryQueryKey(materials.owner._id),
      });
      setOpen(false);
      materials.reset();
      const recorded = data.bookings
        .find((b) => b._id === booking._id)
        ?.sessionUsage?.find((u) => u.session === booking.session);
      successAlert(
        data.alreadyRecorded
          ? `session ${booking.session} materials were already recorded`
          : recorded && recorded.totalCost > 0
            ? `session ${booking.session} recorded · ${formatPesoCents(recorded.totalCost)} materials`
            : `session ${booking.session} recorded`,
      );
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not record the materials")),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !mutation.isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Package className="h-3.5 w-3.5" />
          Session {booking.session} materials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Materials used in session {booking.session}</DialogTitle>
          <DialogDescription>
            {booking.client.name} · session {booking.session} of{" "}
            {booking.sessions.length}. Record only what was actually used in
            this session; planned materials for later sessions are not
            deducted.
          </DialogDescription>
        </DialogHeader>

        <SessionMaterialsPicker booking={booking} state={materials} />

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
              mutation.isPending || materials.isLoading || !materials.isValid
            }
          >
            {mutation.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            Record session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
