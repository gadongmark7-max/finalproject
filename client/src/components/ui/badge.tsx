import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border px-2 py-0.5 text-[10px] font-light uppercase tracking-[0.16em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold/30 aria-invalid:ring-danger/20 aria-invalid:border-danger transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-border-gold bg-surface text-gold [a&]:hover:text-gold-light [a&]:hover:border-gold",
        secondary:
          "border-border bg-surface-alt text-text-muted [a&]:hover:border-border-gold [a&]:hover:text-text",
        destructive:
          "border-danger-border bg-danger-muted text-danger-light [a&]:hover:bg-danger/10 [a&]:hover:border-danger",
        outline:
          "border-border text-text-muted [a&]:hover:border-border-gold [a&]:hover:text-gold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }