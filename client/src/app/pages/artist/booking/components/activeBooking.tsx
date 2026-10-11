"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { BookNextSession } from "./nextSessionBooking";
import { CashPayment } from "./cashPayment";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { isBussinessApproveArtistPayment } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";
import { ReschedModal } from "./reschedModal";
import { CompleteBookingModal } from "./completeBookingModal";
import { RefundDialog } from "./refundDialog";
import {
  BalanceRow,
  BookingCard,
  BookingCardBody,
  BookingEmptyState,
  BookingGrid,
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

  const { data: bussinessInfos } = useQuery({
    queryKey: ["bussiness_Infos"],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(
        `/account/artistBussiness/${user?._id}`,
      );
      return response.data;
    },
  });

  if (!bussinessInfos) return <LoadingScreen />;

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
        return (
          <BookingCard
            key={booking._id}
            booking={booking}
            actions={
              <>
                {booking.session < booking.sessions.length && (
                  <BookNextSession
                    booking={booking}
                    setBookings={setBookings}
                  />
                )}
                <CompleteBookingModal
                  key={`${booking._id}-${booking.session}-${booking.sessionUsage?.length ?? 0}`}
                  booking={booking}
                  setBookings={setBookings}
                />

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
                    <RefundDialog
                      booking={booking}
                      setBookings={setBookings}
                      trigger="icon"
                    />
                  )}

                <ReschedModal booking={booking} setBookings={setBookings} />
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
