"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert"
import useUserStore from "@/app/store/useUserStore"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Plus, ReceiptText, Banknote, CalendarDays, User } from "lucide-react"

export function AddExpencess({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false)
  const { user } = useUserStore()
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState(0)
  const [date, setDate] = useState<Date>()

  const addMutation = useMutation({
    mutationFn: (data: { cost: number; description: string; recordedBy: string; date: string }) =>
      axiosInstance.post("/account/expencess", data),
    onSuccess: () => {
      successAlert(`expencess recorded`)
      setDescription("")
      setCost(0)
      refetch()
    },
    onError: () => errorAlert("error accour"),
  })

  const addExpencesssHanlder = () => {
    if (!cost || !description || !user || !date) return errorAlert("empty field")
    setOpen(false)
    confirmAlert("you want to record this as expencess", "Record", () => {
      addMutation.mutate({
        recordedBy: user.name,
        date: date.toLocaleDateString("en-US").toString(),
        description,
        cost,
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[680px] bg-secondary border border-border rounded-none p-0 overflow-hidden">

        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gold corner brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40 pointer-events-none" />

        <div className="p-8 space-y-7">

          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Financial Record</span>
            </div>
            <DialogTitle
              className="flex items-center gap-3 font-light text-2xl tracking-[-0.02em] text-text"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              <div className="bg-surface-alt border border-border p-2">
                <ReceiptText size={18} className="text-gold" />
              </div>
              Record Expense
            </DialogTitle>
            <DialogDescription className="text-text-muted text-sm leading-relaxed">
              Log a new studio expense entry with date and cost details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 grid grid-cols-2 gap-2">

            <div>


            {/* Description */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Description</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Ink supplies, equipment maintenance…"
              />
              <p className="text-[11px] text-text-dim tracking-wider uppercase">
                Brief note on what this expense covers
              </p>
            </div>

            {/* Cost */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2">
                <div className="bg-surface-alt border border-border p-1.5">
                  <Banknote size={13} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Amount</span>
              </div>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                placeholder="₱0.00"
              />
              <p className="text-[11px] text-text-dim tracking-wider uppercase">
                Enter total cost in Philippine Peso
              </p>
            </div>


            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-surface-alt border border-border p-1.5">
                  <User size={13} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Recorded by</span>
              </div>
              <h1 className="font-bold text-stone-400"> {user?.name} </h1>
              <p className="text-[11px] text-text-dim tracking-wider uppercase">
                Current User
              </p>
            </div>



            </div>

            {/* Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="  p-1.5">
                  <CalendarDays size={13} className="text-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Date of Expense</span>
              </div>
              <div className=" rounded-none p-3">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  captionLayout="dropdown"
                />
              </div>
              {date && (
                <p className="text-[11px] text-text-muted tracking-wider uppercase">
                  Selected — {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2 border-t border-border">
            <Button
              onClick={addExpencesssHanlder}
              disabled={addMutation.isPending}
              className="w-full"
            >
              {addMutation.isPending ? (
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                  <span className="animate-spin h-3.5 w-3.5 border border-current border-t-transparent rounded-full" />
                  Recording…
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-[0.2em]">Record Expense</span>
              )}
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  )
}