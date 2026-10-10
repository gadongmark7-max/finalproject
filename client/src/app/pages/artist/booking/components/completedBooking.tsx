"use client";
import { bookingInterface } from "@/app/types/booking.type";
import { formatPesoCents } from "@/app/utils/customFunction";
import { LogOut } from "lucide-react";
import {
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
  SessionUsageList,
} from "./bookingCard";

export function BookingHistoryDetails({
  booking,
}: {
  booking: bookingInterface;
}) {
  const usage = booking.sessionUsage ?? [];
  const legacy = booking.inventoryConsumption;
  if (usage.length === 0 && !legacy) return null;
  return (
    <details className="group/details border-t border-border px-4 py-3 @sm:px-5">
      <summary className="cursor-pointer select-none text-[10px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text">
        Materials used
      </summary>
      <div className="mt-3 space-y-2">
        <SessionUsageList usage={usage} />
        {legacy && (
          <div className="border border-border px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 text-[10px] uppercase tracking-[0.14em] text-text-dim">
              <span>Recorded on completion</span>
              <span className="text-gold">
                {formatPesoCents(legacy.totalCost)}
              </span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {legacy.items.map((i) => (
                <li
                  key={i.itemId}
                  className="flex flex-wrap justify-between gap-x-3 text-xs text-text-muted"
                >
                  <span className="min-w-0 break-words">{i.item}</span>
                  <span className="whitespace-nowrap">
                    {i.deducted} {i.unit} · {formatPesoCents(i.cost)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

export default function CompletedBookings({
  bookings,
}: {
  bookings: bookingInterface[];
  setBookings: (data: bookingInterface[]) => void;
}) {
  if (bookings.length === 0) {
    return <BookingEmptyState hint="Completed bookings will appear here" />;
  }

  return (
    <BookingGrid>
      {bookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking}>
          <BookingCardBody booking={booking}>
            <PriceRow booking={booking} />
            <PaymentRow booking={booking} />
            <ScheduleRows booking={booking} />
            <SessionRow booking={booking} />
            {booking.closure && (
              <DetailRow icon={LogOut} label="Closed early">
                {booking.closure.sessionsPerformed} of{" "}
                {booking.closure.plannedSessions} sessions
                {booking.closure.unpaidBalance > 0 &&
                  ` · ${formatPesoCents(booking.closure.unpaidBalance)} not billed`}
              </DetailRow>
            )}
            <MaterialsRow booking={booking} />
          </BookingCardBody>
          {booking.closure?.reason && (
            <p className="break-words border-t border-border px-4 py-3 text-xs text-text-muted @sm:px-5">
              <span className="text-[9px] uppercase tracking-[0.18em] text-text-dim">
                Reason:{" "}
              </span>
              {booking.closure.reason}
            </p>
          )}
          <BookingHistoryDetails booking={booking} />
        </BookingCard>
      ))}
    </BookingGrid>
  );
}
