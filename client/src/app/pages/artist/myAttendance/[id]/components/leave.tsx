"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { confirmAlert, errorAlert, successAlert } from "@/app/utils/alert"
import { Calendar1Icon } from "lucide-react"



const leaveTypes = [
  "Sick Leave",
  "Vacation Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Other"
]

export function LeaveModal({
  businessId,
  times,
  days,
  employeeEmail
}: {
  employeeEmail : string
  businessId: string
  times: string[]
  days: string[]
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>()
  const [type, setType] = useState("")

  const mutation = useMutation({
    mutationFn: (data: { date: string; type: string }) =>
      axiosInstance.post(`/account/attendance/leave`, {
        times,
        days,
        businessId,
        date: data.date,
        type: data.type,
        employeeEmail
      }),
    onSuccess: () => {
      successAlert("Request Submitted")
      setOpen(false)
      setDate(undefined)
      setType("")
    },
    onError: () => errorAlert("Error occurred")
  })

  const handleSubmit = () => {
    if (!type || !date) return errorAlert("Complete all fields")
    setOpen(false)
    confirmAlert("Submit leave request?", "Submit", () => {
      mutation.mutate({
        date: date.toISOString().split("T")[0],
        type,
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar1Icon /> Leave
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[350px] w-full">
        <DialogHeader className="pb-2">
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Leave Type Select */}
          <div className="w-full">
            <label className="text-sm text-muted-foreground mb-2 block">
              Leave Type
            </label>
            <Select onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar */}
          <div className="border rounded-lg p-3 shadow-sm ">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              captionLayout="dropdown"
              className="w-full"
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "long"
                })
                return date < today || !days.includes(dayName)
              }}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!date || !type || mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Request Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}