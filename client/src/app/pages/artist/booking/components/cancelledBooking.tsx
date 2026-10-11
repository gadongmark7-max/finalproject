"use client";
import { useQuery } from "@tanstack/react-query";
import { Ban, CalendarX, PhilippinePeso, RotateCw } from "lucide-react";
import {
  cancellationReasonLabel,
  REFUND_METHOD_LABELS,
} from "@/lib/validation/schemas/booking";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import {
  formatPesoCents,
  isBussinessApproveArtistPayment,
} from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";
import { RefundDialog } from "./refundDialog";
import {
  amountPaid,
  BookingCard,
  BookingCardBody,
  BookingEmptyState,
  BookingGrid,
  DetailRow,
  MaterialsRow,
  PaymentRow,
  PriceRow,
  ScheduleRows,
  SessionRow,
} from "./bookingCard";
import { BookingHistoryDetails } from "./completedBooking";

export const CANCELLED_TAB_STATUSES = ["cancelled", "refund", "rejected"];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function CancelledBookings({
  bookings,
  setBookings,
}: {
  bookings: bookingInterface[];
  setBookings: (data: bookingInterface[]) => void;
}) {
  const { user } = useUserStore();

  const { data: bussinessInfos } = useQuery({
    queryKey: ["bussiness_Infos"],
    queryFn: async (): Promise<bussinessInfoInterface[]> =>
      (await axiosInstance.get(`/account/artistBussiness/${user?._id}`)).data,
  });

  if (!bussinessInfos) return <LoadingScreen />;

  if (bookings.length === 0) {
    return (
      <BookingEmptyState
        title="No cancelled bookings"
        hint="Cancelled, refunded and rejected bookings will appear here"
      />
    );
  }

  return (
    <BookingGrid>
      {bookings.map((booking) => {
        const paid = amountPaid(booking);
        const cancellation = booking.cancellation;
        const canRefund =
          booking.status === "cancelled" &&
          paid > 0 &&
          isBussinessApproveArtistPayment(
            booking.bussiness?._id,
            bussinessInfos,
          );
        return (
          <BookingCard
            key={booking._id}
            booking={booking}
            actions={
              canRefund && (
                <RefundDialog booking={booking} setBookings={setBookings} />
              )
            }
          >
            <BookingCardBody booking={booking}>
              <PriceRow booking={booking} />
              <DetailRow icon={PhilippinePeso} label="Paid">
                {formatPesoCents(paid)}
                {booking.status === "cancelled" && paid > 0 && (
                  <span className="text-text-dim"> · not refunded</span>
                )}
              </DetailRow>
              <PaymentRow booking={booking} />
              <ScheduleRows booking={booking} />
              <SessionRow booking={booking} />
              {cancellation && (
                <DetailRow icon={CalendarX} label="Cancelled">
                  {formatDate(cancellation.cancelledAt)} · after{" "}
                  {cancellation.sessionsPerformed}{" "}
                  {cancellation.sessionsPerformed === 1
                    ? "session"
                    : "sessions"}
                </DetailRow>
              )}
              {booking.status === "cancelled" && paid > 0 && (
                <DetailRow icon={RotateCw} label="Refund requested">
                  {cancellation?.requestedRefundMethod
                    ? REFUND_METHOD_LABELS[cancellation.requestedRefundMethod]
                    : "Not specified"}
                </DetailRow>
              )}
              {(booking.sessionUsage?.length ?? 0) > 0 && (
                <MaterialsRow booking={booking} />
              )}
            </BookingCardBody>
            {cancellation?.reason && (
              <p className="break-words border-t border-border px-4 py-3 text-xs text-text-muted @sm:px-5">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-text-dim">
                  <Ban className="h-3 w-3" /> Reason:
                </span>{" "}
                {cancellationReasonLabel(cancellation.reasonCode) ??
                  cancellation.reason}
                {cancellation.reasonDetails && (
                  <span className="mt-1 block text-text-dim">
                    “{cancellation.reasonDetails}”
                  </span>
                )}
                {cancellation.cancelledByRole && (
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-text-dim">
                    Cancelled by {cancellation.cancelledByRole}
                  </span>
                )}
              </p>
            )}
            <BookingHistoryDetails booking={booking} />
          </BookingCard>
        );
      })}
    </BookingGrid>
  );
}
