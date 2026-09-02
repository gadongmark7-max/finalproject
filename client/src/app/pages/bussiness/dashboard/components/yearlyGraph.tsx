"use client"

import { BarChart2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#C9A84C",
  },
} satisfies ChartConfig

export function YearlyBarChart({ data }: { data: { month: string; sales: number }[] }) {
  return (
    <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col">

      {/* Gold bottom reveal */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-border flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Yearly</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Sales Overview · Jan – Dec</p>
        </div>
        <div className="bg-surface-alt border border-border p-2">
          <BarChart2 className="w-3.5 h-3.5 text-gold" />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-3 pb-3 pt-2 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, bottom: 10, left: 0, right: 0 }}
              barSize={28}
            >
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8B6914" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#242424" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#7A7570", fontFamily: "inherit", letterSpacing: "0.05em" }}
                tickFormatter={(value) => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return months[parseInt(value) - 1];
                }}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(201,168,76,0.06)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="sales"
                fill="url(#barGold)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}