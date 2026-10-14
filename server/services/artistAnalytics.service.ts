import { BookingService } from "./booking.service";
import { TransactionService } from "./transaction.service";
import { ExpencesService } from "./expences.service";
import { BOOKING_STATUSES } from "../model/booking.model";

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const validDayKey = (y: number, m: number, d: number): string | null => {
  const c = new Date(y, m - 1, d);
  if (c.getFullYear() !== y || c.getMonth() !== m - 1 || c.getDate() !== d)
    return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
};

const toDayKey = (value?: string | null): string | null => {
  if (!value) return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T)/.exec(text);
  if (iso) return validDayKey(+iso[1], +iso[2], +iso[3]);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (us) return validDayKey(+us[3], +us[1], +us[2]);
  const d = parseDate(text);
  return d ? dayKey(d) : null;
};

const inRange = (
  dateStr: string,
  from: string | null,
  to: string | null,
) => {
  const key = toDayKey(dateStr);
  if (!key) return false;
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
};

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
};

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const last6MonthKeys = () => {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
};

type TransactionLike = {
  amount?: number | null;
  type?: string | null;
  refundedAt?: Date | null;
};

const isRefundRecord = (t: TransactionLike) => t.type === "refund";
const isRefundedPayment = (t: TransactionLike) =>
  !isRefundRecord(t) && !!t.refundedAt;
const sumAmounts = (items: TransactionLike[]) =>
  items.reduce((sum, t) => sum + Number(t.amount || 0), 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

export interface ReportRange {
  from: string | null;
  to: string | null;
}

const bookingStatusCounts = (bookings: { status: string }[]) => {
  const counts: Record<string, number> = {};
  for (const status of BOOKING_STATUSES) counts[status] = 0;
  for (const b of bookings) counts[b.status] = (counts[b.status] || 0) + 1;
  return counts;
};

const bookingMetrics = (counts: Record<string, number>, total: number) => ({
  totalBookings: total,
  pendingBookings: counts["pending"] || 0,
  activeBookings: counts["active"] || 0,
  completedBookings: counts["completed"] || 0,
  rejectedBookings: counts["rejected"] || 0,
  cancelledBookings: counts["cancelled"] || 0,
});

export class ArtistAnalyticsService {
  private static async loadArtistData(artistId: string) {
    const [bookings, transactions, expenses] = await Promise.all([
      BookingService.getByArtist(artistId),
      TransactionService.getByReceiverOrBookingArtist(artistId),
      ExpencesService.getByAccount(artistId),
    ]);
    return { bookings, transactions, expenses };
  }

  static async getDashboard(artistId: string) {
    const { bookings, transactions: allTransactions, expenses } =
      await this.loadArtistData(artistId);

    const payments = allTransactions.filter((t) => !isRefundRecord(t));
    const transactions = payments.filter((t) => !isRefundedPayment(t));
    const grossRevenue = sumAmounts(payments);
    const totalRefunds = sumAmounts(payments.filter(isRefundedPayment));
    const totalRevenue = sumAmounts(transactions);
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.cost || 0),
      0,
    );

    const statusCounts = bookingStatusCounts(bookings);

    const pendingPayments = bookings
      .filter(
        (b) =>
          (b.status === "pending" || b.status === "active") &&
          Number(b.balance) > 0,
      )
      .reduce((sum, b) => sum + Number(b.balance || 0), 0);

    const clientIds = new Set(
      bookings.map((b) => b.client?._id?.toString()).filter(Boolean),
    );

    const monthKeys = last6MonthKeys();
    const revenueByMonth = new Map<string, number>(
      monthKeys.map((k) => [k, 0]),
    );
    const bookingsByMonth = new Map<string, number>(
      monthKeys.map((k) => [k, 0]),
    );

    for (const t of transactions) {
      const key = toDayKey(t.date)?.slice(0, 7);
      if (!key) continue;
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(
          key,
          revenueByMonth.get(key)! + Number(t.amount || 0),
        );
      }
    }

    for (const b of bookings) {
      const key = toDayKey(b.date)?.slice(0, 7);
      if (!key) continue;
      if (bookingsByMonth.has(key)) {
        bookingsByMonth.set(key, bookingsByMonth.get(key)! + 1);
      }
    }

    const paymentMethodCounts = new Map<
      string,
      { count: number; amount: number }
    >();
    for (const t of transactions) {
      const method = t.paymentMethod || "unspecified";
      const entry = paymentMethodCounts.get(method) || { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += Number(t.amount || 0);
      paymentMethodCounts.set(method, entry);
    }

    return {
      stats: {
        totalClients: clientIds.size,
        ...bookingMetrics(statusCounts, bookings.length),
        totalRevenue: round2(totalRevenue),
        grossRevenue: round2(grossRevenue),
        totalRefunds: round2(totalRefunds),
        refundedPayments: payments.length - transactions.length,
        totalPayments: transactions.length,
        pendingPayments,
        totalExpenses,
        netRevenue: round2(totalRevenue - totalExpenses),
      },
      revenueTrend: monthKeys.map((k) => ({
        month: monthLabel(k),
        revenue: Math.round((revenueByMonth.get(k) || 0) * 100) / 100,
      })),
      bookingTrend: monthKeys.map((k) => ({
        month: monthLabel(k),
        count: bookingsByMonth.get(k) || 0,
      })),
      bookingStatus: BOOKING_STATUSES.filter((s) => statusCounts[s] > 0).map(
        (status) => ({
          status,
          count: statusCounts[status],
        }),
      ),
      paymentSummary: Array.from(paymentMethodCounts.entries()).map(
        ([method, v]) => ({
          method,
          count: v.count,
          amount: Math.round(v.amount * 100) / 100,
        }),
      ),
    };
  }

  static async getReport(artistId: string, range: ReportRange) {
    const { bookings, transactions, expenses } =
      await this.loadArtistData(artistId);
    const { from, to } = range;

    const bookingsInRange = bookings.filter((b) => inRange(b.date, from, to));
    const paymentsInRange = transactions.filter(
      (t) => !isRefundRecord(t) && inRange(t.date, from, to),
    );
    const transactionsInRange = paymentsInRange.filter(
      (t) => !isRefundedPayment(t),
    );
    const expensesInRange = expenses.filter((e) => inRange(e.date, from, to));

    const grossRevenue = sumAmounts(paymentsInRange);
    const totalRefunds = sumAmounts(paymentsInRange.filter(isRefundedPayment));
    const totalRevenue = sumAmounts(transactionsInRange);
    const totalExpenses = expensesInRange.reduce(
      (sum, e) => sum + Number(e.cost || 0),
      0,
    );

    const statusCounts = bookingStatusCounts(bookingsInRange);

    const clientFirstBooking = new Map<string, string>();
    for (const b of bookings) {
      const d = toDayKey(b.date);
      const cid = b.client?._id?.toString();
      if (!d || !cid) continue;
      const existing = clientFirstBooking.get(cid);
      if (!existing || d < existing) clientFirstBooking.set(cid, d);
    }

    const clientsInRange = new Set(
      bookingsInRange
        .map((b) => b.client?._id?.toString())
        .filter(Boolean) as string[],
    );

    let newClients = 0;
    let returningClients = 0;
    for (const cid of clientsInRange) {
      const first = clientFirstBooking.get(cid);
      const isNew = !!(first && from && to && first >= from && first <= to);
      if (isNew) newClients++;
      else returningClients++;
    }

    const revenueByDateMap = new Map<string, number>();
    for (const t of transactionsInRange) {
      const key = toDayKey(t.date);
      if (!key) continue;
      revenueByDateMap.set(
        key,
        (revenueByDateMap.get(key) || 0) + Number(t.amount || 0),
      );
    }
    const revenueByDate = Array.from(revenueByDateMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      }));

    const paymentMethodCounts = new Map<
      string,
      { count: number; amount: number }
    >();
    for (const t of transactionsInRange) {
      const method = t.paymentMethod || "unspecified";
      const entry = paymentMethodCounts.get(method) || { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += Number(t.amount || 0);
      paymentMethodCounts.set(method, entry);
    }

    const expensesByCategoryMap = new Map<string, number>();
    for (const e of expensesInRange) {
      const category = (e as any).category || "Other";
      expensesByCategoryMap.set(
        category,
        (expensesByCategoryMap.get(category) || 0) + Number(e.cost || 0),
      );
    }

    return {
      range: { from, to },
      summary: {
        totalRevenue: round2(totalRevenue),
        grossRevenue: round2(grossRevenue),
        totalRefunds: round2(totalRefunds),
        refundedTransactions: paymentsInRange.length - transactionsInRange.length,
        totalTransactions: paymentsInRange.length,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netRevenue: Math.round((totalRevenue - totalExpenses) * 100) / 100,
        ...bookingMetrics(statusCounts, bookingsInRange.length),
        totalClients: clientsInRange.size,
        newClients,
        returningClients,
      },
      revenueByDate,
      paymentMethods: Array.from(paymentMethodCounts.entries()).map(
        ([method, v]) => ({
          method,
          count: v.count,
          amount: Math.round(v.amount * 100) / 100,
        }),
      ),
      bookingsByStatus: Object.entries(statusCounts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          status,
          count,
        })),
      expensesByCategory: Array.from(expensesByCategoryMap.entries()).map(
        ([category, amount]) => ({
          category,
          amount: Math.round(amount * 100) / 100,
        }),
      ),
      transactions: paymentsInRange
        .slice()
        .sort(
          (a, b) =>
            (parseDate(a.date)?.getTime() || 0) -
            (parseDate(b.date)?.getTime() || 0),
        )
        .map((t) => ({
          date: t.date,
          time: t.time,
          refId: t.refId,
          amount: t.amount,
          paymentMethod: t.paymentMethod || "unspecified",
          client: (t.sender as any)?.name || "Unknown",
          bookingId: t.bookingId
            ? String((t.bookingId as any)?._id ?? t.bookingId)
            : null,
          status: isRefundedPayment(t) ? "refunded" : "paid",
          refundedAt: t.refundedAt ? t.refundedAt.toISOString() : null,
        })),
      bookings: bookingsInRange
        .slice()
        .sort(
          (a, b) =>
            (parseDate(a.date)?.getTime() || 0) -
            (parseDate(b.date)?.getTime() || 0),
        )
        .map((b) => ({
          date: b.date,
          client: (b.client as any)?.name || "Unknown",
          status: b.status,
          originalPrice: b.originalPrice,
          balance: b.balance,
        })),
      expenses: expensesInRange
        .slice()
        .sort(
          (a: any, b: any) =>
            (parseDate(a.date)?.getTime() || 0) -
            (parseDate(b.date)?.getTime() || 0),
        )
        .map((e: any) => ({
          date: e.date,
          category: e.category || "Other",
          description: e.description,
          cost: e.cost,
          notes: e.notes || "",
        })),
    };
  }
}

export const parseRangeDate = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  return toDayKey(value);
};
