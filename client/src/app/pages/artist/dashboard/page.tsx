"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import LoadingScreen from "@/components/ui/loadingScreen";
import { Button } from "@/components/ui/button";
import { StatCard } from "./components/statCard";
import { RevenueTrendChart } from "./components/revenueTrendChart";
import { BookingTrendChart } from "./components/bookingTrendChart";
import { DonutChart } from "./components/donutChart";
import { dashboardDataInterface } from "@/app/types/artist.type";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Wallet,
  Receipt,
  TrendingDown,
  TrendingUp,
  LayoutDashboard,
  PieChart,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["artist_dashboard"],
    queryFn: async (): Promise<dashboardDataInterface> => {
      const response = await axiosInstance.get("/artist/dashboard");
      return response.data;
    },
  });

  if (isLoading) return <LoadingScreen />;

  if (isError || !data) {
    return (
      <div className="w-full min-h-dvh bg-primary flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="bg-danger-muted border border-danger-border p-4">
            <AlertCircle className="w-8 h-8 text-danger-light" />
          </div>
          <p className="text-text-muted text-sm">
            We couldn&apos;t load your dashboard right now.
          </p>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const { stats } = data;
  const isEmpty =
    stats.totalBookings === 0 && stats.totalRevenue === 0 && stats.totalExpenses === 0;

  return (
    <div className="w-full min-h-dvh bg-primary">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="w-full flex items-end justify-between border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Artist Intelligence
              </span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Dashboard
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Your business overview, at a glance.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isEmpty && (
          <div className="border border-border-gold bg-surface px-6 py-5 flex items-center gap-4">
            <div className="bg-gold/10 border border-border-gold p-2.5">
              <LayoutDashboard className="w-4 h-4 text-gold" />
            </div>
            <p className="text-sm text-text-muted">
              No bookings, revenue, or expenses recorded yet. Once you start taking bookings and
              logging expenses, your business overview will appear here.
            </p>
          </div>
        )}

        {/* Financial KPIs */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Financial Overview
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-border">
            <StatCard title="Total Revenue" value={stats.totalRevenue} hasPhp icon={Wallet} tone="success" />
            <StatCard title="Total Expenses" value={stats.totalExpenses} hasPhp icon={Receipt} tone="danger" />
            <StatCard
              title="Net Revenue"
              value={stats.netRevenue}
              hasPhp
              icon={stats.netRevenue >= 0 ? TrendingUp : TrendingDown}
              tone={stats.netRevenue >= 0 ? "success" : "danger"}
            />
            <StatCard title="Pending Payments" value={stats.pendingPayments} hasPhp icon={Clock} tone="warning" />
          </div>
        </div>

        {/* Booking KPIs */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Studio Metrics
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid md:grid-cols-5 grid-cols-2 gap-px bg-border">
            <StatCard title="Total Clients" value={stats.totalClients} icon={Users} />
            <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} />
            <StatCard title="Pending" value={stats.pendingBookings} icon={Clock} tone="warning" />
            <StatCard title="Active" value={stats.activeBookings} icon={PieChart} />
            <StatCard title="Completed" value={stats.completedBookings} icon={CheckCircle2} tone="success" />
          </div>
        </div>

        {/* Charts */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <LayoutDashboard className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Analytics</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-px bg-border mb-px">
            <div className="bg-secondary p-1 h-72">
              <RevenueTrendChart data={data.revenueTrend} />
            </div>
            <div className="bg-secondary p-1 h-72">
              <BookingTrendChart data={data.bookingTrend} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-px bg-border">
            <div className="bg-secondary p-1 h-80">
              <DonutChart
                title="Booking Status"
                subtitle="Distribution by Status"
                icon={PieChart}
                labels={data.bookingStatus.map((b) => b.status)}
                series={data.bookingStatus.map((b) => b.count)}
              />
            </div>
            <div className="bg-secondary p-1 h-80">
              <DonutChart
                title="Payments"
                subtitle="By Method"
                icon={Wallet}
                valuePrefix="₱"
                labels={data.paymentSummary.map((p) => p.method)}
                series={data.paymentSummary.map((p) => p.amount)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
