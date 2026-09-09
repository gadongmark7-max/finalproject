"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type MoneyInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value: string
  onChange: (value: string) => void
  decimals?: number
  symbol?: string
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, decimals = 2, symbol = "₱", className, ...props }, ref) => {
    const pattern =
      decimals > 0
        ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`)
        : /^\d*$/

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      if (next === "" || pattern.test(next)) {
        onChange(next)
      }
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
          {symbol}
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          className={cn("pl-8", className)}
        />
      </div>
    )
  },
)
MoneyInput.displayName = "MoneyInput"

export { MoneyInput }
