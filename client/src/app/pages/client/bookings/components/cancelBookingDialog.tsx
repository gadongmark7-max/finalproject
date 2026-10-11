"use client";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Info, LoaderCircle } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { apiErrorMessage, formatPesoCents } from "@/app/utils/customFunction";
import { bookingInterface } from "@/app/types/booking.type";
import { useZodForm } from "@/lib/validation/useZodForm";
import {
  CANCELLATION_DETAILS_MAX,
  CANCELLATION_REASONS,
  clientCancelBookingSchemaFor,
  REFUND_METHOD_LABELS,
  REFUND_METHODS,
  type ClientCancelBookingValues,
} from "@/lib/validation/schemas/booking";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CLIENT_CANCELLABLE_STATUSES = ["pending", "active"];

const amountPaid = (booking: bookingInterface) =>
  Math.max(0, Number(booking.originalPrice) - Number(booking.balance));

const optionClass = (checked: boolean, disabled = false) =>
  `flex items-start gap-2.5 border px-3 py-2 text-sm transition-colors ${
    disabled
      ? "cursor-not-allowed border-border opacity-50"
      : checked
        ? "cursor-pointer border-border-gold bg-surface-alt text-text"
        : "cursor-pointer border-border text-text-muted hover:border-border-gold"
  }`;

export function CancelBookingDialog({
  booking,
  onCancelled,
}: {
  booking: bookingInterface;
  onCancelled: (bookings: bookingInterface[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const paid = amountPaid(booking);
  const hasPayment = paid > 0.004;
  const onlineAvailable = booking.paymentMethod !== "counter";

  const form = useZodForm(clientCancelBookingSchemaFor(hasPayment), {
    defaultValues: {
      reasonCode: undefined,
      reasonDetails: "",
      refundMethod: null,
    },
  });
  const reasonCode = useWatch({ control: form.control, name: "reasonCode" });
  const details = useWatch({ control: form.control, name: "reasonDetails" });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: ClientCancelBookingValues) =>
      axiosInstance.post<{
        alreadyCancelled: boolean;
        bookings: bookingInterface[];
      }>(`/booking/${booking._id}/cancel`, {
        reasonCode: values.reasonCode,
        reasonDetails: values.reasonDetails,
        refundMethod: hasPayment ? values.refundMethod : null,
      }),
    onSuccess: ({ data }) => {
      onCancelled(data.bookings);
      queryClient.invalidateQueries({ queryKey: ["client_booking"] });
      setOpen(false);
      form.reset();
      successAlert(
        data.alreadyCancelled
          ? "This booking was already cancelled"
          : "Booking cancelled. Your artist has been notified.",
      );
    },
    onError: (error) =>
      errorAlert(apiErrorMessage(error, "Could not cancel this booking")),
  });

  const submit = form.handleSubmit((values) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (mutation.isPending) return;
        setOpen(v);
        if (!v) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Ban className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription>
            {booking.artist.name} · {booking.date}. Your artist will be
            notified by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <fieldset className="space-y-2" aria-describedby="cancel-reason-error">
            <legend className="mb-2 text-[10px] uppercase tracking-[0.18em] text-gold">
              Reason for cancelling
            </legend>
            <Controller
              control={form.control}
              name="reasonCode"
              render={({ field }) => (
                <div role="radiogroup" className="space-y-1.5">
                  {CANCELLATION_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className={optionClass(field.value === reason.value)}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={reason.value}
                        checked={field.value === reason.value}
                        onChange={() => field.onChange(reason.value)}
                        onBlur={field.onBlur}
                        className="mt-0.5 accent-[#C6A55C]"
                      />
                      {reason.label}
                    </label>
                  ))}
                </div>
              )}
            />
            <FieldError id="cancel-reason-error">
              {errors.reasonCode?.message}
            </FieldError>
          </fieldset>

          {reasonCode === "other" && (
            <div className="space-y-1.5">
              <label
                htmlFor="cancel-details"
                className="text-[10px] uppercase tracking-[0.18em] text-text-muted"
              >
                Please specify
              </label>
              <Textarea
                id="cancel-details"
                {...form.register("reasonDetails")}
                maxLength={CANCELLATION_DETAILS_MAX}
                placeholder="Tell your artist why you're cancelling"
                aria-invalid={!!errors.reasonDetails}
                className="min-h-20"
              />
              <div className="flex items-start justify-between gap-3">
                <FieldError>{errors.reasonDetails?.message}</FieldError>
                <span className="ml-auto shrink-0 text-[10px] text-text-dim">
                  {(details ?? "").length}/{CANCELLATION_DETAILS_MAX}
                </span>
              </div>
            </div>
          )}

          {hasPayment ? (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-[10px] uppercase tracking-[0.18em] text-gold">
                Preferred refund method
              </legend>
              <p className="text-xs text-text-muted">
                You paid {formatPesoCents(paid)} for this booking.
              </p>
              <Controller
                control={form.control}
                name="refundMethod"
                render={({ field }) => (
                  <div role="radiogroup" className="space-y-1.5">
                    {REFUND_METHODS.map((method) => {
                      const disabled = method === "online" && !onlineAvailable;
                      return (
                        <label
                          key={method}
                          className={optionClass(field.value === method, disabled)}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={method}
                            disabled={disabled}
                            checked={field.value === method}
                            onChange={() => field.onChange(method)}
                            onBlur={field.onBlur}
                            className="mt-0.5 accent-[#C6A55C]"
                          />
                          <span>
                            {REFUND_METHOD_LABELS[method]}
                            {disabled && (
                              <span className="block text-[11px] text-text-dim">
                                Only for payments made online through PayMongo
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError>{errors.refundMethod?.message}</FieldError>
              <p className="flex items-start gap-1.5 text-[11px] text-text-dim">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                This is a refund request only. Your artist reviews it and
                decides whether a refund is eligible; cancelling does not send
                any money back by itself.
              </p>
            </fieldset>
          ) : (
            <p className="flex items-start gap-1.5 text-xs text-text-muted">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              No payment has been recorded for this booking, so there is
              nothing to refund.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Keep booking
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              Cancel booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
