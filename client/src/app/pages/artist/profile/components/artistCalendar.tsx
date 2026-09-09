"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { convertToAmPm } from "@/app/utils/customFunction"
import { postInterface } from "@/app/types/post.type"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { bookingInterfaceInput } from "@/app/types/booking.type"
import useUserStore from "@/app/store/useUserStore"
import { bookingInterface } from "@/app/types/booking.type"
import { LockIcon } from "lucide-react"

export function ArtistCalendar({artistId, times, days} : {artistId : string, times : string[], days : string[]}) {

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [artistBookings, setArtistBookings] = useState<bookingInterface[]>([]);
 
  const { data } = useQuery({
    queryKey: ["artist_booking"],
    queryFn: () => axiosInstance.get(`/booking/artist/${artistId}`),
  });

  useEffect(() => {
    if (data?.data && date) setArtistBookings(data.data.filter((e : bookingInterface) => (e.status === "active" || e.status === "appointment") && e.date == date.toLocaleDateString("en-US").toString() ));
  }, [data, date]);

  const checkIfTimeBooked = (time : string) => {
    if(!date) return 
    let isBooked = false
    if(artistBookings.length == 0) return isBooked
    artistBookings.forEach((item) => {
      if(item.time.includes(time)) isBooked = true
    })
    return isBooked
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-6 w-full mt-8 items-start">
        
        <div className="w-full max-w-sm mx-auto md:max-w-none">
          <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-lg w-full"
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
        </div>

        {date ? (
            <div className="w-full rounded shadow-lg border p-4 sm:p-5">
                <div className="space-y-3">
                    <p className="text-sm font-bold text-stone-600">
                        Date : {date.toLocaleDateString("en-US").toString()}
                    </p>

                    {/* 3. Responsive grid for buttons: 2 columns on tiny phones, 3 on small phones, 4 on desktops */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {times.map((item, index) => (
                            <Button
                                key={item}
                                variant={(checkIfTimeBooked(item)) ? "default" : "outline"}
                                disabled={checkIfTimeBooked(item)}
                                className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-xs sm:text-sm"
                            >
                              {checkIfTimeBooked(item) && <LockIcon className="w-3.5 h-3.5 shrink-0" />}  
                              <span className="truncate">{convertToAmPm(item)}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="w-full min-h-[200px] rounded shadow-lg border flex justify-center items-center p-6 text-center">
                <h1 className="text-base sm:text-lg font-bold text-stone-500">Select Date First</h1>
            </div>
        )}
    </div>
  )
}
