import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border placeholder:text-text-dim focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold/30 aria-invalid:border-danger aria-invalid:ring-danger/20 flex field-sizing-content min-h-16 w-full rounded-none border bg-surface px-3 py-2 text-text text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }