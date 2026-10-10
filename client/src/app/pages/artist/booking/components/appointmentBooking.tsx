"use client";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import axiosInstance from "@/app/utils/axios";
import { bookingInterface } from "@/app/types/booking.type";
import { apiErrorMessage, convertToAmPm } from "@/app/utils/customFunction";
import { Calendar, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { BookingContext } from "../page";
import Link from "next/link";
import {
  BookingCard,
  BookingEmptyState,
  BookingGrid,
} from "./bookingCard";

export default function AppointmentBookings({
  bookings,
}: {
  bookings: bookingInterface[];
  setBookings: (data: bookingInterface[]) => void;
}) {
  const refetch = useContext(BookingContext);

  const completeAppointmentMutation = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(`/booking/appointment/${id}`),
    onSuccess: () => {
      successAlert("mark as done");
      refetch();
    },
    onError: (error) => errorAlert(apiErrorMessage(error, "error occur")),
  });

  const completeAppointmentHandler = (id: string) => {
    confirmAlert(
      "you want to mark as done this appointment?",
      "mark as done",
      () => {
        completeAppointmentMutation.mutate(id);
      },
    );
  };

  if (bookings.length === 0) {
    return <BookingEmptyState hint="Scheduled appointments will appear here" />;
  }

  return (
    <BookingGrid>
      {bookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          actions={
            <>
              <Link href={`/pages/artist/addBooking/new/${booking._id}`}>
                <Button>
                  <Plus className="h-3.5 w-3.5" /> Create Session
                </Button>
              </Link>

              <Button
                hoverText="Mark as Done"
                aria-label="Mark appointment as done"
                className="border border-danger-border bg-danger-muted text-danger-light hover:border-danger hover:bg-danger/10 hover:text-danger-light"
                onClick={() => completeAppointmentHandler(booking._id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          }
        >
          <dl className="grid grid-cols-1 gap-px bg-border @xs:grid-cols-3">
            {[
              { icon: Calendar, label: "Date", value: booking.date },
              {
                icon: Clock,
                label: "Duration",
                value: `${booking.duration} ${booking.duration !== 1 ? "hrs" : "hr"}`,
              },
              {
                icon: Clock,
                label: "Time",
                value: `${convertToAmPm(booking.time[0])} – ${convertToAmPm(booking.time[booking.time.length - 1])}`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-between gap-3 bg-surface px-4 py-3 @xs:block @xs:py-5"
              >
                <dt className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-text-muted @xs:mb-1.5">
                  <Icon className="h-3 w-3 shrink-0 text-gold" /> {label}
                </dt>
                <dd
                  className="min-w-0 break-words text-right text-sm font-light text-text @xs:text-left"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </BookingCard>
      ))}
    </BookingGrid>
  );
}
