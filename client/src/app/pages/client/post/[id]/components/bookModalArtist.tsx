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
import { postInterface } from "@/app/types/post.type"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { errorAlert, successAlert, confirmAlert } from "@/app/utils/alert"
import { bookingInterfaceInput } from "@/app/types/booking.type"
import useUserStore from "@/app/store/useUserStore"
import { bookingInterface } from "@/app/types/booking.type"
import { LockIcon, Loader2 } from "lucide-react"
import { showHealthChecklist } from "@/app/utils/alert"
import { ClientAgreementModal } from "./clientAgreement"
import { useRouter } from "next/navigation"
import { payMongoBooking } from "@/app/utils/payMongo"
import Swal from "sweetalert2"
import { CalendarIcon } from "lucide-react"
import { TattooDataInterface } from "@/app/types/threejs.type"
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal"
import LoadingScreen from "@/components/ui/loadingScreen"

export function ArtistBookModal({ post, artistId, bussinessId, times, days, tattooData } : { tattooData : TattooDataInterface  ,post : postInterface, artistId : string, bussinessId : string | null, times : string[], days : string[]}) {

  
  const {user} = useUserStore()

  const router = useRouter()

  const sessionTime = (post.sessions[0])

  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

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
    if (data?.data && date) setArtistBookings(data.data.filter((e : bookingInterface) => e.status == "active" && e.date == date.toLocaleDateString("en-US").toString() ));
  }, [data, date]);

  const bookMutation = useMutation({
    mutationFn : (booking : bookingInterfaceInput) => axiosInstance.post("/booking", {booking}),
    onSuccess : (response) => {
      const bookingId : string = response.data.bookingId
      setOpen(false)
      setSelectedTime([])
      if(post.downPercentage != 0){
        setIsLoading(true)
        const downPayment = (post.downPercentage / 100) * post.price
        payMongoBooking(downPayment.toString(), user?._id!, post.account._id, bookingId )
      } else {
        Swal.fire({
          icon: "success",
          title: "Booking Placed",
          text: "Please Wait for Artist Approval"
        }).then(() => {
          router.push("/pages/client/bookings")
        });
      }
      
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
      setOpen(false)
      bookMutation.mutate({
        bussiness : bussinessId,
        artist : artistId,
        client : user!._id,
        tattooImg : post.postImg,
        sessions : post.sessions,
        session : 1,
        date : date!.toLocaleDateString("en-US").toString(),
        time : selectedtime,
        duration : selectedtime.length - 1,
        status : "to pay",
        isReviewed : false,
        balance : post.price,
        itemUsed : post.itemUsed,
        tattooData : tattooData,
        originalPrice : post.price
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

  const isDisabled = () => (!date || !selectStartTime || !user) || validateBookings() || selectedtime.length == 0
  
  if(isLoading) return (
    <div className="flex items-center justify-center bg-white flex-col">
          <Loader2 className="w-12 h-12 text-stone-900 animate-spin mb-4" />
          <p className="text-stone-800 font-medium">loading...</p>
    </div>
  )
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
            <Button className="w-full bg-white text-black border border-black hover:bg-black hover:text-white transition-colors "  onClick={() => setOpen(true)}>
                <CalendarIcon  className="w-4 h-4 mr-2" />  Book Now
            </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]" >
        <DialogHeader>
          <DialogTitle>Book a Tattoo Session</DialogTitle>
          <DialogDescription>   
            Fill in the details below to request an appointment with your chosen artist.
          </DialogDescription>
        </DialogHeader>

    
        <div className=" gap-6 mb-6 flex overflow-hidden">
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

        <DialogFooter>
          <ClientAgreementModal isDisabled={isDisabled()} callBack={bookHandler}  down={post.downPercentage} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
