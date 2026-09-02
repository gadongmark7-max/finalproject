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
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { convertToAmPm } from "@/app/utils/customFunction"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { bookingInterface } from "@/app/types/booking.type"
import { LockIcon } from "lucide-react"



export function BookModal({ callBack, sessionTime, artistId, times, days } : { times : string[], days : string[]  ,artistId : string  ,callBack : (data : {date : string, time : string[]}) => void, sessionTime : number}) {

  const [date, setDate] = useState<Date | undefined>(undefined)

  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  
  const [selectedtime, setSelectedTime] = useState<string[]>([])

  const [artistBookings, setArtistBookings] = useState<bookingInterface[]>([]);
 
  const { data } = useQuery({
    queryKey: ["artist_booking"],
    queryFn: () => axiosInstance.get(`/booking/artist/${artistId}`),
  });

  useEffect(() => {
    if (data?.data && date) setArtistBookings(data.data.filter((e : bookingInterface) => (e.status === "active" || e.status === "appointment") && e.date == date.toLocaleDateString("en-US").toString() ));
  }, [data, date]);


  const validateBookings = () => {
    let isError = false
    selectedtime.forEach((item) => {
      if(checkIfTimeBooked(item))  isError = true
    })
    return isError
  }

  const bookHandler = () => {
      callBack({
        date : date!.toLocaleDateString("en-US").toString(),
        time : selectedtime,
      })

  }

  
  const selectStartTime = (index : number) => {

    const selectedItem = []
    
    for(let i = index; i <= (sessionTime + index); i++){
        try{
          selectedItem.push(times[i])
        } catch(e){
          errorAlert("invalid")
          return
        }
       
    }

    setStartTime(times[index])
    setEndTime(times[index + sessionTime])
    setSelectedTime(selectedItem)
  }


  const checkIfTimeBooked = (time : string) => {
    if(!date) return 
    let isBooked = false
    if(artistBookings.length == 0) return isBooked
    artistBookings.forEach((item) => {
      if(item.time.includes(time)) isBooked = true
    })
    return isBooked
  }

  const isDisabled = () => (!date || !selectStartTime || !artistId) || validateBookings() || selectedtime.length == 0 || days.length == 0 || times.length == 0
  

    
  return (
    <div className="w-full">
      <div className=" gap-6 mb-6 flex">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm"
            captionLayout="dropdown"
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0); 
          
              const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
          
              return (
                date < today ||           
                !days.includes(dayName)    
              );
            }}
        />

        {date ? (
            <div className="w-full rounded shadow-lg border p-5">
                <div className="space-y-3">
                    <p className="text-sm font-bold  text-stone-600 ">
                        {startTime && endTime ?`Date : ${date.toLocaleDateString("en-US").toString()} | Duration : ${sessionTime } ${sessionTime != 1 ? "hrs" : "hr"} |  ${convertToAmPm(startTime)} - ${convertToAmPm(endTime)}` : `Date : ${date.toLocaleDateString("en-US").toString()}`}
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                        {times.map((item, index) => (
                            <Button
                                key={item}
                                variant={(selectedtime.includes(item)) ? "default" : "outline"}
                                disabled={checkIfTimeBooked(item)}
                                onClick={() => selectStartTime(index)}
                                className={`${selectedtime.includes(item) && checkIfTimeBooked(item) && "text-red-500 border-2"}`}
                            >
                              {checkIfTimeBooked(item) && <LockIcon />}  {convertToAmPm(item)}
                            </Button>
                        ))}
                    </div>

          
                </div>
            </div>
        ) : (
            <div className="w-full rounded shadow-lg border flex justify-center items-center">
                <h1 className="text-lg font-bold text-stone-500">  Select Date First</h1>
            </div>
        )}

        
      

    </div>

    <Button className="w-full" disabled={isDisabled()} onClick={bookHandler}>
        Add Appointment
    </Button>
  </div>
    
  )
}
