"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { Button } from "@/components/ui/button";
import { CardTempalte } from "./components/cardTemplate";
import { MonthlyChart } from "./components/montlyGraph";
import { YearlyBarChart } from "./components/yearlyGraph";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { TrendingUp, Users, CalendarClock, CalendarCheck, LayoutDashboard } from "lucide-react";

interface AnalyticsInterface {
  totalProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  totalTax: number;
  employee: number;
  pendingBookings: number;
  activeBookings: number;
  activeAppointments: number;
  thisMonthSales: { date: string; sales: number }[];
  yearlySales: { month: string; sales: number }[];
}

export default function Page() {

  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );

  const { user } = useUserStore();

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard_data", selectedMonth],
    queryFn: async (): Promise<AnalyticsInterface> => {
      const response = await axiosInstance.get(`/account/dashboard/${user?._id}/${selectedMonth}`);
      return response.data;
    },
  });

  if (!dashboardData) return <LoadingScreen />;

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

        {/* Page Header */}
        <div className="w-full flex items-end justify-between border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Intelligence</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Dashboard
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Financial overview and studio performance metrics
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Filter by Month</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Financial KPIs */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Financial Overview</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-border">
            <div className="bg-primary">
              <CardTempalte hasPhp={true} title={"Total Profit"} value={dashboardData.totalProfit} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={true} title={"Total Revenue"} value={dashboardData.totalRevenue} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={true} title={"Total Expenses"} value={dashboardData.totalExpenses} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={true} title={"Total Tax"} value={dashboardData.totalTax} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <LayoutDashboard className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Sales Analytics</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-border">
            <div className="col-span-2 bg-secondary border-0 p-1">
              <div className="h-64">
                <MonthlyChart data={dashboardData.thisMonthSales} />
              </div>
            </div>
            <div className="col-span-2 bg-secondary border-0 p-1 hidden md:block">
              <div className="h-64">
                <YearlyBarChart data={dashboardData.yearlySales} />
              </div>
            </div>
          </div>
        </div>

        {/* Studio Metrics */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Metrics</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid md:grid-cols-4 grid-cols-1 gap-px bg-border">
            <div className="bg-primary">
              <CardTempalte hasPhp={false} title={"Employee"} value={dashboardData.employee} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={false} title={"Pending Bookings"} value={dashboardData.pendingBookings} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={false} title={"Active Bookings"} value={dashboardData.activeBookings} />
            </div>
            <div className="bg-primary">
              <CardTempalte hasPhp={false} title={"Active Appointments"} value={dashboardData.activeAppointments} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">
            {months.find(m => m.value === selectedMonth)?.label} · Studio Report
          </p>
          <div className="h-px w-24 bg-border" />
        </div>

      </div>
    </div>
  );
}