"use client";

import { TrendingUp } from "lucide-react";
import ReactApexChart from "@/components/ui/apexChart";

export function RevenueTrendChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  const options = {
    chart: {
      type: "area" as const,
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    theme: { mode: "dark" as const },
    colors: ["#C9A84C"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    grid: { borderColor: "#242424", strokeDashArray: 3 },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { colors: "#7A7570", fontSize: "10px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#7A7570", fontSize: "10px" },
        formatter: (v: number) => `₱${v.toLocaleString()}`,
      },
    },
    tooltip: {
      theme: "dark" as const,
      y: { formatter: (v: number) => `₱${v.toLocaleString()}` },
    },
  };

  const series = [{ name: "Revenue", data: data.map((d) => d.revenue) }];

  return (
    <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col">
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

      <div className="px-6 pt-5 pb-3 border-b border-border flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Revenue</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Last 6 Months</p>
        </div>
        <div className="bg-surface-alt border border-border p-2">
          <TrendingUp className="w-3.5 h-3.5 text-gold" />
        </div>
      </div>

      <div className="flex-1 p-3 min-h-0">
        <ReactApexChart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </div>
  );
}
