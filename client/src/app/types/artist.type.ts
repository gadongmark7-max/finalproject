export const EXPENSE_CATEGORIES = [
  "Ink",
  "Needles & Cartridges",
  "Gloves",
  "Equipment",
  "Tattoo Machines",
  "Studio Supplies",
  "Aftercare Supplies",
  "Rent",
  "Utilities",
  "Marketing",
  "Inventory Usage",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const AUTO_EXPENSE_CATEGORY: ExpenseCategory = "Inventory Usage";

export interface expenseInterface {
  _id: string;
  account: string;
  category: ExpenseCategory;
  description: string;
  cost: number;
  date: string;
  notes?: string;
  recordedBy: string;
  source?: "manual" | "booking_inventory";
  booking?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface expenseInputInterface {
  category: ExpenseCategory;
  description: string;
  cost: number;
  date: string;
  notes?: string;
}

export interface dashboardStatsInterface {
  totalClients: number;
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  totalExpenses: number;
  netRevenue: number;
}

export interface dashboardDataInterface {
  stats: dashboardStatsInterface;
  revenueTrend: { month: string; revenue: number }[];
  bookingTrend: { month: string; count: number }[];
  bookingStatus: { status: string; count: number }[];
  paymentSummary: { method: string; count: number; amount: number }[];
}

export interface reportSummaryInterface {
  totalRevenue: number;
  totalTransactions: number;
  totalExpenses: number;
  netRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
}

export interface reportDataInterface {
  range: { from: string | null; to: string | null };
  summary: reportSummaryInterface;
  revenueByDate: { date: string; revenue: number }[];
  paymentMethods: { method: string; count: number; amount: number }[];
  bookingsByStatus: { status: string; count: number }[];
  expensesByCategory: { category: string; amount: number }[];
  transactions: {
    date: string;
    time: string;
    refId: string;
    amount: number;
    paymentMethod: string;
    client: string;
    bookingId: string | null;
  }[];
  bookings: {
    date: string;
    client: string;
    status: string;
    originalPrice: number;
    balance: number;
  }[];
  expenses: {
    date: string;
    category: string;
    description: string;
    cost: number;
    notes: string;
  }[];
}
