"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, LoaderCircle, Package } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPeso } from "@/app/utils/customFunction";
import { bookingInterface } from "@/app/types/booking.type";
import { inventoryInterface } from "@/app/types/inventory.type";
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

export function CompleteBookingModal({
  booking,
  setBookings,
}: {
  booking: bookingInterface;
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const owner = booking.bussiness ?? booking.artist;
  const isBusinessInventory = !!booking.bussiness;

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventoryData", owner._id],
    queryFn: async (): Promise<inventoryInterface[]> =>
      (await axiosInstance.get(`/inventory/${owner._id}`)).data,
    enabled: open && booking.itemUsed.length > 0,
  });

  const lines = booking.itemUsed.map((used) => {
    const item = inventory?.find((i) => i._id === used.itemId);
    return {
      key: used.itemId,
      name: item?.item ?? used.item,
      qty: used.qty,
      unit: item?.type ?? "",
      stock: item?.stocks,
      cost: item ? used.qty * item.price : 0,
      missing: !!inventory && !item,
    };
  });
  const totalCost = lines.reduce((sum, l) => sum + l.cost, 0);
  const hasShortage = lines.some(
    (l) => l.missing || (l.stock !== undefined && l.stock < l.qty),
  );

  const mutation = useMutation({
    mutationFn: () =>
      axiosInstance.put<bookingInterface[]>(`/booking/status`, {
        id: booking._id,
        status: "completed",
      }),
    onSuccess: ({ data }) => {
      setBookings(data);
      setOpen(false);
      const consumption = data.find(
        (b) => b._id === booking._id,
      )?.inventoryConsumption;
      successAlert(
        consumption?.expense
          ? `completed · ${formatPeso(consumption.totalCost)} inventory expense recorded`
          : "booking completed",
      );
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not complete this booking")),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !mutation.isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button hoverText={"Mark as Complete"}>
          <Check className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete booking</DialogTitle>
          <DialogDescription>
            {booking.client.name} · the items used below will be deducted from{" "}
            {isBusinessInventory ? `${owner.name}'s` : "your"} inventory.
          </DialogDescription>
        </DialogHeader>

        {booking.itemUsed.length === 0 ? (
          <p className="text-sm text-text-muted">
            No inventory items were recorded for this booking, so nothing will
            be deducted and no inventory expense will be created.
          </p>
        ) : isLoading ? (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <LoaderCircle className="w-4 h-4 animate-spin" /> Loading inventory…
          </p>
        ) : (
          <div className="space-y-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
                  <th className="text-left font-normal pb-1.5">Item</th>
                  <th className="text-right font-normal pb-1.5">Used</th>
                  <th className="text-right font-normal pb-1.5">In stock</th>
                  <th className="text-right font-normal pb-1.5">Cost</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.key} className="border-t border-border">
                    <td className="py-1.5 pr-2 text-text">
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-gold shrink-0" />
                        {l.name}
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-text-muted whitespace-nowrap">
                      {l.qty} {l.unit}
                    </td>
                    <td
                      className={`py-1.5 text-right whitespace-nowrap ${
                        l.missing || (l.stock ?? 0) < l.qty
                          ? "text-danger-light"
                          : "text-text-muted"
                      }`}
                    >
                      {l.missing ? "removed" : l.stock}
                    </td>
                    <td className="py-1.5 text-right text-text whitespace-nowrap">
                      {l.missing ? "—" : formatPeso(l.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasShortage && (
              <p
                className="flex items-start gap-1.5 text-[11px] text-danger-light"
                role="alert"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                Some items have less stock than was used (or were removed).
                Their stock will be set to 0; removed items are skipped.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="text-text-muted">Inventory cost</span>
              <span className="text-gold">{formatPeso(totalCost)}</span>
            </div>
            <p className="text-[11px] text-text-dim">
              {isBusinessInventory
                ? "Business inventory purchases are already recorded as business expenses, so only the stock is deducted."
                : totalCost > 0
                  ? "An “Inventory Usage” expense for this amount will be added to your expenses automatically."
                  : "These items have no price set, so no expense will be created."}
            </p>
          </div>
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
              mutation.isPending || (booking.itemUsed.length > 0 && isLoading)
            }
          >
            {mutation.isPending && (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            )}
            Complete booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
