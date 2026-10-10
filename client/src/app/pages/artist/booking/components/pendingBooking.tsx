"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "@/app/utils/axios";
import { bookingInterface } from "@/app/types/booking.type";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { rejectionReason } from "@/app/utils/alert";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import { payMongoRefund } from "@/app/utils/payMongo";
import LoadingScreen from "@/components/ui/loadingScreen";
import {
  BalanceRow,
  BookingCard,
  BookingCardBody,
  BookingEmptyState,
  BookingGrid,
  PaymentRow,
  ScheduleRows,
  SessionRow,
} from "./bookingCard";
import { CancelBookingModal } from "./cancelBookingModal";

export default function PendingBookings({
  bookings,
  setBookings,
}: {
  bookings: bookingInterface[];
  setBookings: (data: bookingInterface[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: (data: {
      id: string;
      status: string;
      reason: string;
      clientId: string;
    }) => axiosInstance.put(`/booking/status`, data),
    onSuccess: (response) => {
      setBookings(response.data);
      successAlert("Success");
    },
    onError: () => errorAlert("error occur"),
  });

  const handleApprove = (booking: bookingInterface) => {
    confirmAlert("you want to approve this Booking?", "approve", () => {
      updateStatusMutation.mutate({
        id: booking._id,
        status: "active",
        reason: "none",
        clientId: booking.client._id,
      });
    });
  };

  const handleReject = (booking: bookingInterface) => {
    confirmAlert("you want to Reject this Booking?", "Reject", () => {
      rejectionReason((reason) => {
        updateStatusMutation.mutate({
          id: booking._id,
          status: "rejected",
          reason: reason,
          clientId: booking.client._id,
        });
        setIsLoading(true);
        setTimeout(() => {
          payMongoRefund(
            (booking.originalPrice - booking.balance).toString(),
            booking.bussiness ? booking.bussiness._id : booking.artist._id,
            booking.client._id,
          );
        }, 2000);
      });
    });
  };

  if (isLoading) return <LoadingScreen />;

  if (bookings.length === 0) {
    return <BookingEmptyState hint="New booking requests will appear here" />;
  }

  return (
    <BookingGrid>
      {bookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          actions={
            <>
              {booking.tattooData && (
                <ViewTattoo3DModal
                  booking={booking}
                  key={booking._id}
                  tattooData={booking.tattooData}
                  img={booking.tattooImg}
                  rejectCallback={handleReject}
                  approveCallback={handleApprove}
                />
              )}
              <CancelBookingModal
                booking={booking}
                setBookings={setBookings}
              />
            </>
          }
        >
          <BookingCardBody booking={booking}>
            <BalanceRow booking={booking} />
            <PaymentRow booking={booking} />
            <ScheduleRows booking={booking} />
            <SessionRow booking={booking} />
          </BookingCardBody>
        </BookingCard>
      ))}
    </BookingGrid>
  );
}
