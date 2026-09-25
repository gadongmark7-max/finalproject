"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorAlert } from "@/app/utils/alert";
import { reportDataInterface } from "@/app/types/artist.type";
import {
  downloadArtistReportExcel,
  downloadArtistReportPdf,
} from "@/app/utils/artistReportExport";
import {
  FileDown,
  FileSpreadsheet,
  AlertCircle,
  CalendarRange,
  Wallet,
  Receipt,
  TrendingUp,
  Users,
  Inbox,
} from "lucide-react";

const toDateInputValue = (d: Date) => d.toISOString().slice(0, 10);

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return toDateInputValue(d);
};

export default function Page() {
  const { user } = useUserStore();
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [appliedRange, setAppliedRange] = useState({
    from: defaultFrom(),
    to: toDateInputValue(new Date()),
  });

  const rangeInvalid = useMemo(() => {
    if (!from || !to) return false;
    return new Date(from) > new Date(to);
  }, [from, to]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["artist_reports", appliedRange.from, appliedRange.to],
    queryFn: async (): Promise<reportDataInterface> => {
      const response = await axiosInstance.get("/artist/reports", {
        params: { from: appliedRange.from, to: appliedRange.to },
      });
      return response.data;
    },
  });

  const applyFilter = () => {
    if (rangeInvalid) {
      errorAlert("The 'From' date must be before the 'To' date");
      return;
    }
    setAppliedRange({ from, to });
  };

  const handleDownloadPdf = () => {
    if (!data) return;
    downloadArtistReportPdf(data, user?.name || "Artist");
  };

  const handleDownloadExcel = () => {
    if (!data) return;
    downloadArtistReportExcel(data, user?.name || "Artist");
  };

  const isEmpty =
    !!data &&
    data.summary.totalBookings === 0 &&
    data.summary.totalTransactions === 0 &&
    data.summary.totalExpenses === 0;

  return (
    <div className="w-full min-h-dvh bg-primary">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="w-full border-b border-border bg-secondary px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Business Reports
              </span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Reports
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Revenue, bookings, clients, and expenses for a chosen date range.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                From
              </span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-surface border border-border px-3 py-2 text-sm text-text focus:outline-none focus:border-border-gold transition-colors duration-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                To
              </span>
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                className="bg-surface border border-border px-3 py-2 text-sm text-text focus:outline-none focus:border-border-gold transition-colors duration-200"
              />
            </div>
            <Button
              onClick={applyFilter}
              disabled={isFetching}
              className="flex items-center gap-2"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={!data || isFetching}
              className="flex items-center gap-2"
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              disabled={!data || isFetching}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-10 relative z-10">
        {rangeInvalid && (
          <div className="border border-danger-border bg-danger-muted px-5 py-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-danger-light shrink-0" />
            <p className="text-sm text-danger-light">
              The &quot;From&quot; date must be before the &quot;To&quot; date.
            </p>
          </div>
        )}

        {isLoading && <LoadingScreen />}

        {!isLoading && isError && (
          <div className="border border-danger-border bg-danger-muted px-6 py-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-danger-light" />
            <p className="text-sm text-danger-light">
              {/* @ts-expect-error axios error shape */}
              {error?.response?.data ||
                "Couldn't load the report for this range."}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {isEmpty ? (
              <div className="border border-border bg-surface px-6 py-12 flex flex-col items-center gap-3 text-center">
                <Inbox className="w-6 h-6 text-text-dim" />
                <p className="text-sm text-text-muted">
                  No bookings, transactions, or expenses were found for this
                  date range.
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <TrendingUp className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      Summary
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid md:grid-cols-4 grid-cols-2 gap-px bg-border">
                    {[
                      {
                        label: "Total Revenue",
                        value: data.summary.totalRevenue,
                        php: true,
                        icon: Wallet,
                      },
                      {
                        label: "Total Expenses",
                        value: data.summary.totalExpenses,
                        php: true,
                        icon: Receipt,
                      },
                      {
                        label: "Net Revenue",
                        value: data.summary.netRevenue,
                        php: true,
                        icon: TrendingUp,
                      },
                      {
                        label: "Total Clients",
                        value: data.summary.totalClients,
                        php: false,
                        icon: Users,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-primary p-6 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                            {s.label}
                          </p>
                          <s.icon className="w-3.5 h-3.5 text-gold" />
                        </div>
                        <p
                          className="text-2xl font-light text-text tabular-nums"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {s.php && <span className="text-gold mr-1">₱</span>}
                          {s.value.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-6 grid-cols-2 gap-px bg-border mt-px">
                    {[
                      ["Bookings", data.summary.totalBookings],
                      ["Pending", data.summary.pendingBookings],
                      ["Active", data.summary.activeBookings],
                      ["Completed", data.summary.completedBookings],
                      ["New Clients", data.summary.newClients],
                      ["Returning", data.summary.returningClients],
                    ].map(([label, value]) => (
                      <div key={label as string} className="bg-primary p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-1">
                          {label}
                        </p>
                        <p className="text-lg font-light text-text">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transactions table */}
                <ReportTable
                  title="Transactions"
                  subtitle={`${data.transactions.length} record(s)`}
                  isEmpty={data.transactions.length === 0}
                  emptyLabel="No transactions in this range."
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Ref ID</TableHead>
                      <TableHead className="text-end">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((t, i) => (
                      <TableRow key={`${t.refId}-${i}`}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.client}</TableCell>
                        <TableCell className="capitalize">
                          {t.paymentMethod}
                        </TableCell>
                        <TableCell className="text-text-dim">
                          {t.refId}
                        </TableCell>
                        <TableCell className="text-end">
                          ₱{t.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ReportTable>

                {/* Bookings table */}
                <ReportTable
                  title="Bookings"
                  subtitle={`${data.bookings.length} record(s)`}
                  isEmpty={data.bookings.length === 0}
                  emptyLabel="No bookings in this range."
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-end">Price</TableHead>
                      <TableHead className="text-end">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.bookings.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>{b.date}</TableCell>
                        <TableCell>{b.client}</TableCell>
                        <TableCell className="capitalize">{b.status}</TableCell>
                        <TableCell className="text-end">
                          ₱{b.originalPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-end">
                          ₱{b.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ReportTable>

                <ReportTable
                  title="Expenses"
                  subtitle={`${data.expenses.length} record(s)`}
                  isEmpty={data.expenses.length === 0}
                  emptyLabel="No expenses in this range."
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-end">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.category}</TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell className="text-end">
                          ₱{e.cost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ReportTable>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReportTable({
  title,
  subtitle,
  isEmpty,
  emptyLabel,
  children,
}: {
  title: string;
  subtitle: string;
  isEmpty: boolean;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
          {title}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim">
          {subtitle}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="border border-border overflow-x-auto">
        <Table>{children}</Table>
      </div>
      {isEmpty && (
        <p className="text-xs text-text-dim mt-3 uppercase tracking-widest">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
