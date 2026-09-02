"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ResponsiveContainer } from "recharts"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#C9A84C",
  },
} satisfies ChartConfig

export function MonthlyChart({ data }: { data: { date: string; sales: number }[] }) {
  return (
    <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden flex flex-col">

      {/* Gold bottom reveal */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-border flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Monthly</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Sales Chart</p>
        </div>
        <div className="bg-surface-alt border border-border p-2">
          <TrendingUp className="w-3.5 h-3.5 text-gold" />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#242424" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={2}
                tick={{ fontSize: 10, fill: "#7A7570", fontFamily: "inherit", letterSpacing: "0.05em" }}
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={{ stroke: "#C9A84C", strokeWidth: 1, strokeOpacity: 0.4 }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="sales"
                type="natural"
                fill="url(#goldGradient)"
                fillOpacity={1}
                stroke="#C9A84C"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default MonthlyChart