"use client";
import { useQuery } from "@tanstack/react-query";
import { Ban, CalendarX, PhilippinePeso, RotateCw } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import {
  formatPesoCents,
  isBussinessApproveArtistPayment,
} from "@/app/utils/customFunction";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/loadingScreen";
import { useBookingRefund } from "./useBookingRefund";
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
  const { handleRefund, isRedirecting } = useBookingRefund(setBookings);

  const { data: bussinessInfos } = useQuery({
    queryKey: ["bussiness_Infos"],
    queryFn: async (): Promise<bussinessInfoInterface[]> =>
      (await axiosInstance.get(`/account/artistBussiness/${user?._id}`)).data,
  });

  if (!bussinessInfos || isRedirecting) return <LoadingScreen />;

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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRefund(booking)}
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Refund {formatPesoCents(paid)}
                </Button>
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
              {(booking.sessionUsage?.length ?? 0) > 0 && (
                <MaterialsRow booking={booking} />
              )}
            </BookingCardBody>
            {cancellation?.reason && (
              <p className="break-words border-t border-border px-4 py-3 text-xs text-text-muted @sm:px-5">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-text-dim">
                  <Ban className="h-3 w-3" /> Reason:
                </span>{" "}
                {cancellation.reason}
              </p>
            )}
            <BookingHistoryDetails booking={booking} />
          </BookingCard>
        );
      })}
    </BookingGrid>
  );
}
