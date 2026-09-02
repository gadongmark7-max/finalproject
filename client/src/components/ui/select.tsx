"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // base
        "flex w-fit items-center justify-between gap-2 rounded-none",
        "bg-surface border border-border",
        "px-4 py-3 text-sm font-light tracking-[0.06em]",
        "text-text whitespace-nowrap outline-none",
        // placeholder
        "data-[placeholder]:text-stone-400",
        // chevron icon color
        "[&_svg:not([class*='text-'])]:text-text-muted",
        // shadow
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]",
        // transition
        "transition-all duration-200",
        // size
        "data-[size=default]:h-11 data-[size=sm]:h-10",
        // value slot
        "*:data-[slot=select-value]:line-clamp-1",
        "*:data-[slot=select-value]:flex",
        "*:data-[slot=select-value]:items-center",
        "*:data-[slot=select-value]:gap-2",
        // svg
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // hover — gold shadow
        "hover:border-gold/40 hover:shadow-[4px_4px_0px_0px_rgba(201,168,76,0.2)]",
        // open state — gold border
        "data-[state=open]:border-gold data-[state=open]:shadow-[4px_4px_0px_0px_rgba(201,168,76,0.25)]",
        // focus
        "focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold/30",
        // invalid
        "aria-invalid:border-danger aria-invalid:shadow-[4px_4px_0px_0px_rgba(139,58,58,0.3)]",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-30",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // base
          "bg-surface text-text border border-border rounded-none",
          // shadow + gold glow
          "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6),0_0_0_1px_rgba(201,168,76,0.07)]",
          // sizing
          "relative z-50 max-h-(--radix-select-content-available-height)",
          "min-w-[8rem] origin-(--radix-select-content-transform-origin)",
          "overflow-x-hidden overflow-y-auto",
          // animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // popper offset
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "text-gold text-[10px] font-semibold uppercase tracking-[0.28em]",
        "px-3 py-2 border-b border-border mb-1",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // base
        "relative flex w-full cursor-default items-center gap-2 rounded-none",
        "py-2.5 pr-8 pl-3 text-sm font-light tracking-[0.04em]",
        "text-text-muted outline-none select-none",
        // transition
        "transition-colors duration-150",
        // hover / focus — gold tint
        "focus:bg-surface-alt focus:text-text",
        "data-[highlighted]:bg-surface-alt data-[highlighted]:text-text",
        // selected indicator color
        "[&_svg:not([class*='text-'])]:text-gold",
        // svg
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-30",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 text-gold stroke-[2.5px]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "bg-border pointer-events-none -mx-1 my-1 h-px",
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1.5",
        "text-text-muted border-b border-border",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4 text-gold" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1.5",
        "text-text-muted border-t border-border",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4 text-gold" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}