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
import { useState, useEffect, useContext } from "react"
import { Calendar } from "@/components/ui/calendar"
import { convertToAmPm } from "@/app/utils/customFunction"
import { postInterface } from "@/app/types/post.type"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert } from "@/app/utils/alert"
import { bookingInterfaceInput } from "@/app/types/booking.type"
import useUserStore from "@/app/store/useUserStore"
import { bookingInterface } from "@/app/types/booking.type"
import { LockIcon , Calendar1Icon} from "lucide-react"
import { BookingContext } from "../page"
import { bussinessInfoInterface } from "@/app/types/accounts.type"

export function BookNextSession({ booking } : {booking : bookingInterface}) {

  const { data: bussinessInfoData } = useQuery({
    queryKey: ['bussiness_profile'],
    queryFn: async (): Promise<bussinessInfoInterface> => {
      const response = await axiosInstance.get(`/account/bussinessInfo/${booking?.bussiness?._id}`);
      return response.data;
    },
  });

 
  const [times, setTimes] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);


  useEffect(() => {
    if(bussinessInfoData?.artists){
      bussinessInfoData?.artists.forEach((artist) => {  
        if(artist.artist._id == booking.artist._id){
          setTimes(artist.schedTime)
          setDays(artist.schedDay)
        }
      })
    }
  }, [bussinessInfoData])
  
  
  const refetch = useContext(BookingContext)
  
  const {user} = useUserStore()

  const sessionTime = (booking.sessions[booking.session])

  const [open, setOpen] = useState(false);

  const [date, setDate] = useState<Date | undefined>(undefined)

  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  
  const [selectedtime, setSelectedTime] = useState<string[]>([])


  const [artistBookings, setArtistBookings] = useState<bookingInterface[]>([]);
 
  const { data } = useQuery({
    queryKey: ["artist_booking"],
    queryFn: () => axiosInstance.get(`/booking/artist/${booking?.artist._id}`),
  });

  useEffect(() => {
    if (data?.data && date) setArtistBookings(data.data.filter((e : bookingInterface) => e.status == "active" && e.date == date.toLocaleDateString("en-US").toString() ));
  }, [data, date]);

  const bookMutation = useMutation({
    mutationFn : (data : {newTime  :string[], newDate : string, id : string}) => axiosInstance.post("/booking/bookNextSession",data),
    onSuccess : (response) => {
      refetch()
      setOpen(false)
      successAlert("booking submited")
      setSelectedTime([])
    }, 
    onError : () => errorAlert("error accour")
  })




 const validateBookings = () => {
    let isError = false
    selectedtime.forEach((item) => {
      if(checkIfTimeBooked(item))  isError = true
    })
    return isError
  }

  const bookHandler = () => {
    if(!date || !selectStartTime || !user || selectedtime.length == 0) return errorAlert("empty date or time")
    if(validateBookings()) return errorAlert('invalid time')
  
    bookMutation.mutate({
        id : booking._id,
        newDate : date.toLocaleDateString("en-US").toString(),
        newTime : selectedtime
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
  

    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button hoverText={"Schedule Next Session"}  onClick={() => setOpen(true)}>
               <Calendar1Icon /> 
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Book a Tattoo Session</DialogTitle>
          <DialogDescription>   
            Fill in the details below to request an appointment with your chosen artist.
          </DialogDescription>
        </DialogHeader>

    
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
                                 key={index}
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

        <DialogFooter>
          <Button className="w-full" onClick={bookHandler}>  Confirm Booking  </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
