"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import LoadingScreen from "@/components/ui/loadingScreen";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseModal } from "./components/expenseModal";
import { EXPENSE_CATEGORIES, expenseInterface } from "@/app/types/artist.type";
import { Search, X, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["artist_expenses"],
    queryFn: async (): Promise<expenseInterface[]> => {
      const response = await axiosInstance.get("/artist/expenses");
      return response.data;
    },
  });

  const expenses = useMemo(() => data || [], [data]);

  const filtered = useMemo(() => {
    let list = [...expenses];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.notes || "").toLowerCase().includes(q),
      );
    }

    if (category !== "all") {
      list = list.filter((e) => e.category === category);
    }

    if (from) {
      const fromDate = new Date(from);
      list = list.filter((e) => {
        const d = new Date(e.date);
        return !Number.isNaN(d.getTime()) && d >= fromDate;
      });
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      list = list.filter((e) => {
        const d = new Date(e.date);
        return !Number.isNaN(d.getTime()) && d <= toDate;
      });
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search, category, from, to]);

  const totalFiltered = filtered.reduce((sum, e) => sum + e.cost, 0);
  const totalAll = expenses.reduce((sum, e) => sum + e.cost, 0);

  const hasActiveFilters = !!search || category !== "all" || !!from || !!to;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setFrom("");
    setTo("");
  };

  return (
    <div className="w-full min-h-dvh bg-primary">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Header */}
      <div className="w-full border-b border-border bg-secondary px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-start flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Management</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Expenses
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Track supplies, equipment, and other business costs.
            </p>
          </div>
          <div className="pt-2">
            <ExpenseModal />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-6 relative z-10">
        {isLoading && <LoadingScreen />}

        {!isLoading && isError && (
          <div className="border border-danger-border bg-danger-muted px-6 py-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-danger-light" />
            <p className="text-sm text-danger-light">We couldn&apos;t load your expenses.</p>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Totals */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-px bg-border">
              <div className="bg-surface p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">
                    Total Expenses (Filtered)
                  </p>
                  <p
                    className="text-2xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <span className="text-gold mr-1">₱</span>
                    {totalFiltered.toLocaleString()}
                  </p>
                </div>
                <Receipt className="w-5 h-5 text-gold" />
              </div>
              <div className="bg-surface p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">
                    Total Expenses (All Time)
                  </p>
                  <p
                    className="text-2xl font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <span className="text-gold mr-1">₱</span>
                    {totalAll.toLocaleString()}
                  </p>
                </div>
                <Receipt className="w-5 h-5 text-text-dim" />
              </div>
            </div>

            {/* Filters bar */}
            <div className="bg-secondary border border-border px-5 py-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search description or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-border pl-9 pr-9 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-border-gold transition-colors duration-200"
                />
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-surface border border-border px-2.5 py-2 text-xs text-text focus:outline-none focus:border-border-gold"
                />
                <span className="text-text-dim text-xs">to</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-surface border border-border px-2.5 py-2 text-xs text-text focus:outline-none focus:border-border-gold"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-dim hover:text-danger-light border border-transparent hover:border-danger-border transition-all duration-200"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-end">Amount</TableHead>
                    <TableHead className="text-end">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                          <Receipt className="w-6 h-6 text-text-dim" />
                          {expenses.length === 0 ? (
                            <p className="text-sm text-text-muted">
                              No expenses recorded yet. Add your first one to get started.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-text-muted">No expenses match your filters.</p>
                              <button onClick={clearFilters} className="text-xs text-gold hover:underline">
                                Clear filters
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {filtered.map((e) => (
                    <TableRow key={e._id} className="hover:bg-surface transition-colors duration-200">
                      <TableCell>{e.date}</TableCell>
                      <TableCell>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-text-muted border border-border px-2 py-1">
                          {e.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-text">{e.description}</TableCell>
                      <TableCell className="text-text-dim text-sm max-w-[220px] truncate">
                        {e.notes || "—"}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">₱{e.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-end">
                        <ExpenseModal expense={e} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
