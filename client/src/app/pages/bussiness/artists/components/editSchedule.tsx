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
  Edit,
  DollarSignIcon
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { convertToAmPm } from "@/app/utils/customFunction"
import { accountInterface } from "@/app/types/accounts.type"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function EditSchedule({ artist, currentDays, CurrentTime, hrs, currentSalary, currentSalaryType, currentCommision }: {currentCommision : number,  artist: accountInterface ,  currentDays  : string[], CurrentTime : string[], hrs  : number,currentSalary : number, currentSalaryType : string}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [selectedDays, setSelectedDays] = useState(currentDays)
  const [dutyHours, setDutyHours] = useState<number>(hrs)
  const [time, setTime] = useState(CurrentTime)

  const [commision, setCommision] = useState(currentCommision || 0)

  const [salary, setSalary] = useState(currentSalary || 0)
  const [salaryType, setSalaryType] = useState(currentSalaryType || "hr")



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
    mutationFn: (data: { id: string; day: string[]; time: string[], type : string ,salary : number, salaryType : string, commision : number }) =>
      axiosInstance.put("/account/schedule", data),
    onSuccess: () => {
      successAlert("Schedule updated")
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ["bussiness_profile"] })
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
      type : "bussiness_artist",
      salary,
      salaryType,
      commision
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Edit /> </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] space-y-4">
        <DialogHeader className="text-center">
          <DialogTitle></DialogTitle>
          <DialogDescription>
           
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
            <Input className="w-24"   placeholder="custom hrs" onChange={(e) => setDutyHours(Number(e.target.value)) }/>
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

        <div className="space-y-2">
            <div className="mb-2 flex gap-3">
                <Label className="flex items-center gap-2 text-xs">
                    <DollarSignIcon className="w-4 h-4" />
                    Employee Salary
                </Label>
                <p className="text-xs text-muted-foreground">
                    Enter the employee’s salary and select how it is defined.
                </p>
            </div>


    

            <div className="flex gap-2 ">
                <Input
                type="number"
                min={0}
                placeholder="Salary amount"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                />

                <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Salary type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="hr">Hourly</SelectItem>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
                </Select>

                <div className="relative w-full">
                  <label className="absolute -top-2 left-3  text-stone-400 px-1 text-xs font-medium">
                    Commission Percentage
                  </label>

                  <Input
                    type="number"
                    min={0}
                    placeholder=" "
                    value={commision}
                    onChange={(e) => setCommision(Number(e.target.value))}
                  />
                </div>
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
