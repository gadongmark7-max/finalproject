import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-[#C6A55C]/50 relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {

        // ── PRIMARY — Gold fill, the main CTA
        default:
          "relative overflow-hidden " +
          "bg-[linear-gradient(135deg,#B8923F_0%,#C9A84C_25%,#E8C97A_50%,#C9A84C_75%,#A67C32_100%)] " +
          "text-[#080808] font-medium tracking-[0.08em] " +
          "border border-[#E8C97A] " +
          "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset,0_4px_16px_-2px_rgba(201,168,76,0.3)] " +
          "hover:bg-[linear-gradient(135deg,#C9A84C_0%,#E8C97A_30%,#F0D585_50%,#E0BC60_75%,#B8923F_100%)] " +
          "hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_-1px_0_rgba(0,0,0,0.3)_inset,0_8px_28px_-4px_rgba(201,168,76,0.55)] " +
          "hover:-translate-y-[1px] " +
          "active:translate-y-0 active:shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_-1px_0_rgba(0,0,0,0.4)_inset] " +
          "active:bg-[linear-gradient(135deg,#A67C32_0%,#B8923F_40%,#C9A84C_100%)] " +
          "before:absolute before:inset-0 " +
          "before:bg-[repeating-linear-gradient(105deg,transparent_0px,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] " +
          "after:absolute after:inset-0 " +
          "after:bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.22)_48%,rgba(255,255,255,0.08)_52%,transparent_65%)] " +
          "after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-600 " +
          "transition-all duration-300",
        // ── GHOST GOLD — Outlined gold, secondary action
        outline:
          "bg-transparent text-[#C6A55C] border border-[#C6A55C]/50 " +
          "hover:border-[#C6A55C] hover:bg-[#C6A55C]/8 hover:text-[#E6C77B] hover:-translate-y-[2px] " +
          "hover:shadow-[0_8px_24px_-6px_rgba(198,165,92,0.25)] " +
          "active:translate-y-0 " +
          "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#C6A55C] " +
          "hover:after:w-full after:transition-all after:duration-300",

        // ── SURFACE — Muted dark, tertiary
        secondary:
          "bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A] " +
          "hover:bg-[#222222] hover:text-[#F5F5F5] hover:border-[#C6A55C]/30 hover:-translate-y-[1px] " +
          "hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6)] " +
          "active:translate-y-0",

        // ── DESTRUCTIVE — Deep red, danger action
        destructive:
          "bg-[#1A0A0A] text-[#E05555] border border-[#E05555]/30 " +
          "hover:bg-[#E05555]/10 hover:border-[#E05555]/60 hover:text-[#FF7070] hover:-translate-y-[1px] " +
          "hover:shadow-[0_6px_24px_-4px_rgba(224,85,85,0.25)] " +
          "active:translate-y-0",

        // ── GHOST — Invisible, text only
        ghost:
          "bg-transparent text-[#A1A1A1] border border-transparent " +
          "hover:text-[#C6A55C] hover:bg-[#C6A55C]/6 " +
          "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 " +
          "after:h-[1px] after:w-0 after:bg-[#C6A55C]/60 " +
          "hover:after:w-4/5 after:transition-all after:duration-300",

        // ── LINK — Inline gold text link
        link:
          "bg-transparent text-[#C6A55C] border-none p-0 h-auto tracking-[0.1em] font-medium " +
          "hover:text-[#E6C77B] " +
          "after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#C6A55C] " +
          "hover:after:w-full after:transition-all after:duration-300",
      },

      size: {
        default: "h-11 px-7 py-3 has-[>svg]:px-5",
        sm:      "h-9 px-5 text-[10px] tracking-[0.18em] has-[>svg]:px-4",
        lg:      "h-13 px-10 text-sm tracking-[0.22em] has-[>svg]:px-7",
        icon:    "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  hoverText = null,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    hoverText?: string | null
  }) {
  const Comp = asChild ? Slot : "button"

  if (hoverText) {
    return (
      <div className="relative inline-block group">
        <span
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap
            bg-[#121212] text-[#C6A55C] border border-[#C6A55C]/25
            text-[9px] px-3 py-1.5 tracking-[0.2em] uppercase font-semibold
            opacity-0 group-hover:opacity-100 transition-all duration-200
            translate-y-1 group-hover:translate-y-0
            shadow-[0_4px_16px_rgba(0,0,0,0.6)] z-50"
        >
          {hoverText}
        </span>
        <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      </div>
    )
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }