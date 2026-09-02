"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  side = "top",
  sideOffset = 8,
  avoidCollisions = true,
  collisionPadding = 16,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        side={side}
        sideOffset={sideOffset}
        avoidCollisions={avoidCollisions}
        collisionPadding={collisionPadding}
        className={cn(
          // base
          "bg-surface text-text border border-border rounded-none",
          // shadow + gold glow ring
          "shadow-[0_8px_40px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(201,168,76,0.07)]",
          // size
          "z-50 w-72 p-4 outline-none",
          // origin
          "origin-(--radix-popover-content-transform-origin)",
          // animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // gold corner brackets
          "before:absolute before:top-0 before:left-0 before:w-8 before:h-8",
          "before:border-t before:border-l before:border-gold before:opacity-30",
          "after:absolute after:bottom-0 after:right-0 after:w-8 after:h-8",
          "after:border-b after:border-r after:border-gold after:opacity-30",
          "relative overflow-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }