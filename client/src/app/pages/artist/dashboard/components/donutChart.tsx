"use client";

import { LucideIcon } from "lucide-react";
import ReactApexChart from "@/components/ui/apexChart";

const PALETTE = ["#C9A84C", "#8B6914", "#4E7C59", "#7AAE87", "#A0722A", "#8B3A3A", "#C26060"];

export function DonutChart({
  title,
  subtitle,
  icon: Icon,
  labels,
  series,
  valuePrefix,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  labels: string[];
  series: number[];
  valuePrefix?: string;
}) {
  const options = {
    chart: {
      type: "donut" as const,
      background: "transparent",
      fontFamily: "inherit",
    },
    theme: { mode: "dark" as const },
    labels: labels.map((l) => l.charAt(0).toUpperCase() + l.slice(1)),
    colors: PALETTE,
    stroke: { colors: ["#1A1A1A"], width: 2 },
    legend: {
      position: "bottom" as const,
      labels: { colors: "#7A7570" },
      fontSize: "10px",
      markers: { size: 6 },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: "10px" },
      dropShadow: { enabled: false },
    },
    tooltip: {
      theme: "dark" as const,
      y: { formatter: (v: number) => `${valuePrefix ?? ""}${v.toLocaleString()}` },
    },
    plotOptions: {
      pie: { donut: { labels: { show: true, total: { show: true, color: "#F2EDE4" } } } },
    },
  };

  const isEmpty = series.every((v) => v === 0) || series.length === 0;

  return (
    <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col">
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

      <div className="px-6 pt-5 pb-3 border-b border-border flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">{title}</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">{subtitle}</p>
        </div>
        <div className="bg-surface-alt border border-border p-2">
          <Icon className="w-3.5 h-3.5 text-gold" />
        </div>
      </div>

      <div className="flex-1 p-3 min-h-0 flex items-center justify-center">
        {isEmpty ? (
          <p className="text-xs text-text-dim uppercase tracking-widest">No data yet</p>
        ) : (
          <ReactApexChart options={options} series={series} type="donut" height="100%" width="100%" />
        )}
      </div>
    </div>
  );
}
