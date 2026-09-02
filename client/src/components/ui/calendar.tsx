"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-surface border border-border p-4 group/calendar [--cell-size:--spacing(8)]",
        "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-30 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-30 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center justify-center h-(--cell-size) gap-1.5",
          "text-sm font-light tracking-[0.1em] text-text",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative border border-border has-focus:border-gold rounded-none",
          "has-focus:ring-1 has-focus:ring-gold/30 shadow-none",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-surface inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-light tracking-[0.12em] uppercase text-text",
          captionLayout === "label"
            ? "text-xs"
            : "rounded-none pl-2 pr-1 flex items-center gap-1 text-xs h-8 [&>svg]:text-gold [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-text-dim flex-1 font-normal text-[0.7rem] tracking-[0.15em] uppercase select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-text-dim",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          "[&:last-child[data-selected=true]_button]:rounded-r-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-none"
            : "[&:first-child[data-selected=true]_button]:rounded-l-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-none bg-gold/15",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "rounded-none bg-gold/10",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-none bg-gold/15",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-surface-alt text-gold rounded-none border border-gold/30 data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-text-dim aria-selected:text-text-dim opacity-40",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-text-dim opacity-25 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-4 text-gold", className)}
                {...props}
              />
            )
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-gold", className)}
                {...props}
              />
            )
          }
          return (
            <ChevronDownIcon
              className={cn("size-4 text-gold", className)}
              {...props}
            />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center text-text-dim">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        // selected single day — gold fill
        "data-[selected-single=true]:bg-gold data-[selected-single=true]:text-primary data-[selected-single=true]:border data-[selected-single=true]:border-gold-dim",
        // range states — gold tinted
        "data-[range-middle=true]:bg-gold/10 data-[range-middle=true]:text-text",
        "data-[range-start=true]:bg-gold data-[range-start=true]:text-primary",
        "data-[range-end=true]:bg-gold data-[range-end=true]:text-primary",
        // rounded-none everywhere
        "data-[range-end=true]:rounded-none data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-none",
        // focus ring — gold
        "group-data-[focused=true]/day:border-gold group-data-[focused=true]/day:ring-gold/30",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[2px]",
        // base
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1",
        "leading-none font-normal rounded-none text-text-muted hover:text-text hover:bg-surface-alt",
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }