import * as React from "react"

import { cn } from "@/lib/utils"


function FieldError({
  children,
  className,
  id,
}: {
  children?: React.ReactNode
  className?: string
  id?: string
}) {
  if (!children) return null
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "mt-1.5 text-[11px] font-light tracking-[0.06em] text-danger-light",
        className,
      )}
    >
      {children}
    </p>
  )
}

export { FieldError }
