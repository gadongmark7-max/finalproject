"use client";
import { ReactNode } from "react";
import {
  Calendar,
  Clock,
  Layers,
  LucideIcon,
  Package,
  PhilippinePeso,
  Wallet,
} from "lucide-react";
import {
  bookingInterface,
  bookingSessionUsageInterface,
} from "@/app/types/booking.type";
import { accountInterface } from "@/app/types/accounts.type";
import { convertToAmPm, formatPesoCents } from "@/app/utils/customFunction";
import { bookingPaymentLabel } from "@/lib/validation/schemas/booking";

const serif = { fontFamily: "'Cormorant Garamond', serif" };

export const bookingStatusStyle: Record<string, string> = {
  pending: "bg-warning-muted text-warning-light border border-warning-border",
  completed: "bg-success-muted text-success-light border border-success-border",
  rejected: "bg-danger-muted text-danger-light border border-danger-border",
  cancelled: "bg-danger-muted text-danger-light border border-danger-border",
  refund: "bg-warning-muted text-warning-light border border-warning-border",
  active: "bg-info-muted text-info-light border border-info-border",
  appointment: "border border-border text-text-muted bg-surface-alt",
};

const statusLabel: Record<string, string> = {
  refund: "refunded",
};

export const isSessionRecorded = (booking: bookingInterface, session: number) =>
  (booking.sessionUsage ?? []).some((u) => u.session === session);

export const sessionsPerformed = (booking: bookingInterface) =>
  isSessionRecorded(booking, booking.session)
    ? booking.session
    : Math.max(0, booking.session - 1);

export const amountPaid = (booking: bookingInterface) =>
  Math.max(0, Number(booking.originalPrice) - Number(booking.balance));

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 ${bookingStatusStyle[status] ?? "border border-border text-text-muted"}`}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}

function Party({
  account,
  label,
}: {
  account: accountInterface;
  label: string;
}) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <img
        src={account.profile}
        alt=""
        className="h-9 w-9 shrink-0 border border-border object-cover"
      />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gold">
          {label}
        </p>
        <p
          className="line-clamp-2 break-words text-sm font-light leading-snug text-text"
          style={serif}
          title={account.name}
        >
          {account.name}
        </p>
      </div>
    </div>
  );
}

export function BookingCard({
  booking,
  children,
  actions,
}: {
  booking: bookingInterface;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className="@container group/card relative flex min-w-0 flex-col border border-border bg-surface transition-all duration-500 hover:border-border-gold">
      <div className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-0 bg-gold transition-all duration-700 group-hover/card:w-full" />

      <header className="flex items-start justify-between gap-x-3 gap-y-2 border-b border-border px-4 py-3 @sm:px-5 @sm:py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          <Party account={booking.client} label="Client" />
          {booking.bussiness && (
            <>
              <div className="hidden h-8 w-px shrink-0 bg-border @md:block" />
              <Party account={booking.bussiness} label="Studio" />
            </>
          )}
        </div>
        <BookingStatusBadge status={booking.status} />
      </header>

      {children}

      {actions && (
        <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 @sm:px-5 @sm:py-4">
          {actions}
        </footer>
      )}
    </article>
  );
}

export function BookingCardBody({
  booking,
  children,
}: {
  booking: bookingInterface;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 @xs:flex-row @sm:p-5">
      {booking.tattooImg && booking.tattooImg !== "none" && (
        <img
          src={booking.tattooImg}
          alt="Tattoo design"
          className="aspect-[4/3] w-full shrink-0 border border-border object-cover @xs:aspect-auto @xs:h-32 @xs:w-24 @md:h-36 @md:w-28"
        />
      )}
      <dl className="min-w-0 flex-1 space-y-2.5">{children}</dl>
    </div>
  );
}

export function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
      <dt className="flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-text-muted">
        <Icon className="h-3 w-3 shrink-0 text-gold" /> {label}
      </dt>
      <dd className="ml-auto min-w-0 break-words text-right text-xs text-text-muted">
        {children}
      </dd>
    </div>
  );
}

export function BalanceRow({ booking }: { booking: bookingInterface }) {
  return (
    <DetailRow icon={PhilippinePeso} label="Balance">
      {booking.balance <= 0 ? (
        <span className="inline-block whitespace-nowrap border border-success-border bg-success-muted px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-success-light">
          Fully Paid
        </span>
      ) : (
        <span className="text-sm font-light text-gold" style={serif}>
          ₱{booking.balance.toLocaleString()}
        </span>
      )}
    </DetailRow>
  );
}

export function PriceRow({ booking }: { booking: bookingInterface }) {
  return (
    <DetailRow icon={PhilippinePeso} label="Price">
      <span className="text-sm font-light text-gold" style={serif}>
        ₱{booking.originalPrice.toLocaleString()}
      </span>
    </DetailRow>
  );
}

export function PaymentRow({ booking }: { booking: bookingInterface }) {
  return (
    <DetailRow icon={Wallet} label="Payment">
      {bookingPaymentLabel(booking)}
    </DetailRow>
  );
}

export function ScheduleRows({ booking }: { booking: bookingInterface }) {
  return (
    <>
      <DetailRow icon={Calendar} label="Date">
        {booking.date}
      </DetailRow>
      <DetailRow icon={Clock} label="Duration">
        {booking.duration} {booking.duration !== 1 ? "hrs" : "hr"}
      </DetailRow>
      <DetailRow icon={Clock} label="Time">
        <span className="whitespace-nowrap">
          {convertToAmPm(booking.time[0])}
        </span>{" "}
        –{" "}
        <span className="whitespace-nowrap">
          {convertToAmPm(booking.time[booking.time.length - 1])}
        </span>
      </DetailRow>
    </>
  );
}

export function SessionRow({ booking }: { booking: bookingInterface }) {
  return (
    <DetailRow icon={Layers} label="Session">
      <span className="flex flex-wrap items-center justify-end gap-1">
        {booking.sessions.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-5 border border-gold ${i < booking.session ? "bg-gold" : "bg-transparent"}`}
          />
        ))}
      </span>
    </DetailRow>
  );
}

export function MaterialsRow({ booking }: { booking: bookingInterface }) {
  const usage = booking.sessionUsage ?? [];
  const legacy = booking.inventoryConsumption;
  const total =
    usage.reduce((sum, u) => sum + Number(u.totalCost || 0), 0) +
    Number(legacy?.totalCost ?? 0);
  if (usage.length === 0 && !legacy) {
    return (
      <DetailRow icon={Package} label="Materials">
        Not recorded
      </DetailRow>
    );
  }
  return (
    <DetailRow icon={Package} label="Materials">
      {formatPesoCents(total)}
      {usage.length > 0 && (
        <span className="text-text-dim">
          {" "}
          · {usage.length} {usage.length === 1 ? "session" : "sessions"}
        </span>
      )}
    </DetailRow>
  );
}

export function SessionUsageList({
  usage,
}: {
  usage: bookingSessionUsageInterface[];
}) {
  if (usage.length === 0) return null;
  return (
    <div className="space-y-2">
      {usage.map((u) => (
        <div key={u.session} className="border border-border px-3 py-2">
          <div className="flex flex-wrap items-center justify-between gap-x-3 text-[10px] uppercase tracking-[0.14em] text-text-dim">
            <span>Session {u.session}</span>
            <span className="text-gold">{formatPesoCents(u.totalCost)}</span>
          </div>
          {u.items.length === 0 ? (
            <p className="mt-1 text-xs text-text-muted">No materials used</p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {u.items.map((i) => (
                <li
                  key={i.itemId}
                  className="flex flex-wrap justify-between gap-x-3 text-xs text-text-muted"
                >
                  <span className="min-w-0 break-words">{i.item}</span>
                  <span className="whitespace-nowrap">
                    {i.qty} {i.unit} · {formatPesoCents(i.cost)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function BookingGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

export function BookingEmptyState({
  title = "No bookings found",
  hint = "Booking requests will appear here",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="relative border border-border bg-surface px-6 py-12 text-center sm:p-16">
      <div className="pointer-events-none absolute left-0 top-0 h-12 w-12 border-l border-t border-gold opacity-40" />
      <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 border-r border-t border-gold opacity-40" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-12 border-b border-l border-gold opacity-40" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 border-b border-r border-gold opacity-40" />
      <p
        className="mb-3 text-3xl font-light text-text-dim sm:text-4xl"
        style={serif}
      >
        {title}
      </p>
      <p className="text-sm text-text-muted">{hint}</p>
    </div>
  );
}
