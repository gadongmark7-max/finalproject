"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { RotateCw } from "lucide-react";
import { BookNextSession } from "./nextSessionBooking";
import { Button } from "@/components/ui/button";
import { CashPayment } from "./cashPayment";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { isBussinessApproveArtistPayment } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";
import { ReschedModal } from "./reschedModal";
import { CompleteBookingModal, canCloseBooking } from "./completeBookingModal";
import { RecordSessionMaterialsModal } from "./recordSessionMaterialsModal";
import { CancelBookingModal } from "./cancelBookingModal";
import { useBookingRefund } from "./useBookingRefund";
import {
  BalanceRow,
  BookingCard,
  BookingCardBody,
  BookingEmptyState,
  BookingGrid,
  isSessionRecorded,
  MaterialsRow,
  PaymentRow,
  ScheduleRows,
  SessionRow,
} from "./bookingCard";

export default function ActiveBookings({
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
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(
        `/account/artistBussiness/${user?._id}`,
      );
      return response.data;
    },
  });

  if (!bussinessInfos || isRedirecting) return <LoadingScreen />;

  if (bookings.length === 0) {
    return <BookingEmptyState hint="Approved bookings will appear here" />;
  }

  return (
    <BookingGrid>
      {bookings.map((booking) => {
        const canHandlePayment = isBussinessApproveArtistPayment(
          booking.bussiness?._id,
          bussinessInfos,
        );
        const currentRecorded = isSessionRecorded(booking, booking.session);
        return (
          <BookingCard
            key={booking._id}
            booking={booking}
            actions={
              <>
                {!currentRecorded && (
                  <RecordSessionMaterialsModal
                    booking={booking}
                    setBookings={setBookings}
                  />
                )}
                {booking.session < booking.sessions.length &&
                  currentRecorded && (
                    <BookNextSession
                      booking={booking}
                      setBookings={setBookings}
                    />
                  )}
                {canCloseBooking(booking) && (
                  <CompleteBookingModal
                    key={booking._id + booking.session + currentRecorded}
                    booking={booking}
                    setBookings={setBookings}
                  />
                )}

                {booking.balance !== 0 && canHandlePayment && (
                  <CashPayment
                    booking={booking}
                    key={booking._id + booking.balance}
                  />
                )}

                {booking.tattooData && (
                  <ViewTattoo3DModal
                    key={booking._id}
                    booking={booking}
                    tattooData={booking.tattooData}
                    img={booking.tattooImg}
                  />
                )}

                {booking.originalPrice > booking.balance &&
                  canHandlePayment && (
                    <Button
                      hoverText={"Refund"}
                      aria-label="Refund"
                      onClick={() => handleRefund(booking)}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                  )}

                <ReschedModal booking={booking} setBookings={setBookings} />

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
              <MaterialsRow booking={booking} />
            </BookingCardBody>
          </BookingCard>
        );
      })}
    </BookingGrid>
  );
}
