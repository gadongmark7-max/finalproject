import { BookingService } from "./booking.service";
import { TransactionService } from "./transaction.service";
import { ExpencesService } from "./expences.service";

const BOOKING_STATUSES = [
  "appointment",
  "pending",
  "active",
  "completed",
  "rejected",
  "refund",
];

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const endOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
};

const inRange = (dateStr: string, from: Date | null, to: Date | null) => {
  const d = parseDate(dateStr);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
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

export interface ReportRange {
  from: Date | null;
  to: Date | null;
}

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
    const { bookings, transactions, expenses } =
      await this.loadArtistData(artistId);

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.cost || 0),
      0,
    );

    const statusCounts: Record<string, number> = {};
    for (const status of BOOKING_STATUSES) statusCounts[status] = 0;
    for (const b of bookings) {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    }

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
      const d = parseDate(t.date);
      if (!d) continue;
      const key = monthKey(d);
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(
          key,
          revenueByMonth.get(key)! + Number(t.amount || 0),
        );
      }
    }

    for (const b of bookings) {
      const d = parseDate(b.date);
      if (!d) continue;
      const key = monthKey(d);
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
        totalBookings: bookings.length,
        pendingBookings: statusCounts["pending"] || 0,
        activeBookings: statusCounts["active"] || 0,
        completedBookings: statusCounts["completed"] || 0,
        rejectedBookings: statusCounts["rejected"] || 0,
        totalRevenue,
        totalPayments: transactions.length,
        pendingPayments,
        totalExpenses,
        netRevenue: totalRevenue - totalExpenses,
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
    const transactionsInRange = transactions.filter((t) =>
      inRange(t.date, from, to),
    );
    const expensesInRange = expenses.filter((e) => inRange(e.date, from, to));

    const totalRevenue = transactionsInRange.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0,
    );
    const totalExpenses = expensesInRange.reduce(
      (sum, e) => sum + Number(e.cost || 0),
      0,
    );

    const statusCounts: Record<string, number> = {};
    for (const b of bookingsInRange) {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    }

    const clientFirstBooking = new Map<string, Date>();
    for (const b of bookings) {
      const d = parseDate(b.date);
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
      const d = parseDate(t.date);
      if (!d) continue;
      const key = dayKey(d);
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
      range: {
        from: from ? dayKey(from) : null,
        to: to ? dayKey(to) : null,
      },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions: transactionsInRange.length,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netRevenue: Math.round((totalRevenue - totalExpenses) * 100) / 100,
        totalBookings: bookingsInRange.length,
        pendingBookings: statusCounts["pending"] || 0,
        activeBookings: statusCounts["active"] || 0,
        completedBookings: statusCounts["completed"] || 0,
        rejectedBookings: statusCounts["rejected"] || 0,
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
      bookingsByStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      expensesByCategory: Array.from(expensesByCategoryMap.entries()).map(
        ([category, amount]) => ({
          category,
          amount: Math.round(amount * 100) / 100,
        }),
      ),
      transactions: transactionsInRange
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
          bookingId: t.bookingId ? String(t.bookingId) : null,
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

export const parseRangeDate = (
  value: unknown,
  boundary: "start" | "end",
): Date | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = parseDate(value);
  if (!d) return null;
  return boundary === "start" ? startOfDay(d) : endOfDay(d);
};
