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
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  Calendar,
  Clock,
  LoaderCircle,
  User,
  Edit
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { convertToAmPm } from "@/app/utils/customFunction"
import { accountInterface } from "@/app/types/accounts.type"

const times = [
  "01:00","02:00","03:00","04:00","05:00","06:00",
  "07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00",
  "19:00","20:00","21:00","22:00", "23:00", "00:00"
]

const days = [
  "Monday","Tuesday","Wednesday",
  "Thursday","Friday","Saturday","Sunday"
]

const dutyOptions = [4, 6, 8, 10, 12]

export function EditSchedule({ artist, currentDays, CurrentTime, hrs }: { artist: accountInterface ,  currentDays  : string[], CurrentTime : string[], hrs  : number}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [selectedDays, setSelectedDays] = useState(currentDays)
  const [dutyHours, setDutyHours] = useState<number>(hrs)
  const [time, setTime] = useState(CurrentTime)

  /* TOGGLE DAY (PUSH / POP) */
  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  /* SELECT START TIME */
  const selectStartTime = (index : number) => {
    const selectedItem = []
    for(let i = index; i <= (dutyHours + index); i++){
      selectedItem.push(times[i])
    }
    setTime(selectedItem)
  }

  const uploadMutation = useMutation({
    mutationFn: (data: { id: string; day: string[]; time: string[], type : string }) =>
      axiosInstance.put("/account/schedule", data),
    onSuccess: () => {
      successAlert("Schedule updated")
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ["artist_profile"] })
    },
    onError: () => errorAlert("Something went wrong"),
  })

  const handleSave = () => {
    if (!selectedDays.length || !time.length) {
      return errorAlert("Select days and time")
    }
    uploadMutation.mutate({
      id: artist._id,
      day: selectedDays,
      time,
      type : "artist"
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button> Edit Schedule </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] space-y-4">
        <DialogHeader className="text-center">
          <DialogTitle>Edit Artist Schedule</DialogTitle>
          <DialogDescription>
            Configure working days and hours
          </DialogDescription>
        </DialogHeader>

   
        {/* DAYS */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Working Days
          </Label>
          <p className="text-xs text-muted-foreground">
            Click to toggle available days
          </p>

          <div className="flex flex-wrap gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-md border text-sm transition
                  ${
                    selectedDays.includes(day)
                      ? "bg-gold text-secodnary border-primary"
                      : "hover:bg-secondary border-gold text-gold"
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* DUTY HOURS */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duty Hours
          </Label>
          <p className="text-xs text-muted-foreground">
            Hours per working day
          </p>

          <div className="flex gap-2 flex-wrap">
            {dutyOptions.map(hour => (
              <Button
                key={hour}
                size="sm"
                variant={dutyHours === hour ? "default" : "outline"}
                onClick={() => {
                  setDutyHours(hour)
                  setTime([]) // reset invalid time
                }}
              >
                {hour} hrs
              </Button>
            ))}
          </div>
        </div>

        {/* TIME */}
        <div className="space-y-2">
          <Label>Start Time</Label>
          <p className="text-xs text-muted-foreground">
            Only valid start times are selectable
          </p>

          <div className="flex flex-wrap gap-2">
            {times.map((t, i) => {
              const isDisabled = i + dutyHours + 1 > times.length 

              return (
                <Button
                  key={t}
                  size="sm"
                  disabled={isDisabled}
                  variant={time.includes(t) ? "default" : "outline"}
                  onClick={() => selectStartTime(i)}
                >
                  {convertToAmPm(t)}
                </Button>
              )
            })}
          </div>
        </div>

      

        <DialogFooter>
          <Button
            className="w-full gap-2"
            disabled={uploadMutation.isPending}
            onClick={handleSave}
          >
            {uploadMutation.isPending && (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
