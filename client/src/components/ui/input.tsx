import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base layout
        "h-11 w-full min-w-0 px-4 py-3 text-sm",
        // colors
        "bg-surface border border-border",
        "text-text font-light tracking-[0.06em]",
        // placeholder
        "placeholder:text-stone-400 placeholder:font-light placeholder:tracking-normal placeholder:normal-case",
        // selection
        "selection:bg-gold selection:text-primary",
        // file input
        "file:text-text file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // shape
        "rounded-none",
        // shadow
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]",
        // transition
        "transition-all duration-200 outline-none",
        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30",
        // focus — gold border + glow
        "focus-visible:border-gold focus-visible:shadow-[4px_4px_0px_0px_rgba(201,168,76,0.25)] focus-visible:ring-1 focus-visible:ring-gold/30",
        // invalid — danger tokens
        "aria-invalid:border-danger aria-invalid:shadow-[4px_4px_0px_0px_rgba(139,58,58,0.3)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }