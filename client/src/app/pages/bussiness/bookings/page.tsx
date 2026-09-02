"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect , createContext} from "react";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { convertToAmPm } from "@/app/utils/customFunction";
import {
  User,
  Calendar,
  Clock,
  Image as ImageIcon,
  Layers,
  DollarSign,
  Plus,
  Check,
  X,
  PhilippinePeso,
  RotateCw
} from "lucide-react";
import Link from "next/link";
import { successAlert, errorAlert, confirmAlert, rejectionReason } from "@/app/utils/alert";
import { Button } from "@/components/ui/button";
import { BookNextSession } from "./components/nextSessionBooking";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import SubscriptionExpired from "@/components/ui/subscriptionExpired"
import { checkIfSubsExpired } from "@/app/utils/customFunction"
import { ReschedModal } from "./components/reschedModal";
import LoadingScreen from "@/components/ui/loadingScreen";
import { payMongoRefund } from "@/app/utils/payMongo";



const statusStyle: Record<string, string> = {
    pending:     "bg-warning-muted text-warning-light border border-warning-border",
    completed:   "bg-success-muted text-success-light border border-success-border",
    rejected:    "bg-danger-muted text-danger-light border border-danger-border",
    active:      "bg-info-muted text-info-light border border-info-border",
    appointment: "border border-border text-text-muted bg-surface-alt",
  };

export const BookingContext = createContext<() => void>(() => {});


export default function Page() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<bookingInterface[]>([]);

  const [isloading, setIsLoading] = useState(false);

  const [type, setType] = useState("active");

  const { data, refetch } = useQuery({
    queryKey: ["bussiness_booking"],
    queryFn: () => axiosInstance.get(`/booking/bussiness/${user?._id}`),
  });

  useEffect(() => {
    if (data?.data){
        setBookings(data.data.filter((e : bookingInterface) => e.status == type ))
    } 
  }, [data, type]);


  const completeAppointmentMutation = useMutation({
    mutationFn : (id : string) => axiosInstance.delete(`/booking/appointment/${id}`),
    onSuccess : () => {
      successAlert("mark as done")
      refetch()
    },
    onError : () => errorAlert("error accour")
  })

  const updateStatusMutation = useMutation({
    mutationFn : (data :  {id  :string , status : string, reason : string, clientId : string }) => axiosInstance.put(`/booking/status`, data),
    onSuccess : (response) => {
        refetch()
        if(!isloading) successAlert("Success") 
    },
    onError : () => errorAlert("ERROR ACCOUR")
  })

    const handleApprove = (booking : bookingInterface) => {
        confirmAlert("you want to approve this Booking?", "approve", () => {
            updateStatusMutation.mutate({
                id : booking._id,
                status : "active",
                reason : "none",
                clientId : booking.client._id
            })
        })
    }



    const handleReject = (booking : bookingInterface) => {
        confirmAlert("you want to Reject this Booking?", "Reject", () => {
            rejectionReason((reason) => {
                updateStatusMutation.mutate({
                    id : booking._id,
                    status : "rejected",
                    reason : reason,
                    clientId : booking.client._id
                })
                setIsLoading(true)
                setTimeout(() => {
                    payMongoRefund((booking.originalPrice - booking.balance).toString(), booking.bussiness ? booking.bussiness._id : booking.artist._id, booking.client._id)
                }, 2000)
            })
        })
    }


    const handleRefund = (booking : bookingInterface) => {
        confirmAlert("you want to Refund this Booking?", "Refund", () => {
          updateStatusMutation.mutate({
              id : booking._id,
              status : "refund",
              reason : "none",
              clientId : booking.client._id
          })
          setIsLoading(true)
          setTimeout(() => {
              payMongoRefund((booking.originalPrice - booking.balance).toString(), booking.bussiness ? booking.bussiness._id : booking.artist._id, booking.client._id)
          }, 2000)
        })
    }


  const handleComplete = (booking : bookingInterface) => {
    confirmAlert("this session is complete?", "complete", () => {
        updateStatusMutation.mutate({
            id : booking._id,
            status : "completed",
            reason : "none",
            clientId : booking.client._id
        })
    })
  }


  const completeAppointmentHandler = (id : string) => {
    confirmAlert("you want to mark as done this appointment?", "mark as done", () => {
        completeAppointmentMutation.mutate(id)
    })
  }


  bookings.forEach((item) => {
    if(item.status == "active"){
        console.log(item)
    }
 
  })

  if(isloading || !user) return <LoadingScreen />


  if(checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />

  

  return (
    <BookingContext.Provider value={refetch}>
    <div className="w-full min-h-dvh bg-primary overflow-auto">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-10">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Management</span>
          </div>
          <h1
            className="text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Booking History
          </h1>
        </div>

        {/* Status Tabs + Add Appointment */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {(["active", "appointment", "pending", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setType(tab)}
                className={`text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-200 ${
                  type === tab
                    ? "border-gold text-gold bg-surface-alt"
                    : "border-border text-text-muted hover:border-border-gold hover:text-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link href={"/pages/bussiness/appointment"}>
            <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 border border-gold text-gold bg-surface-alt hover:bg-surface transition-all duration-200">
              <Plus className="w-3.5 h-3.5" /> Add Appointment
            </button>
          </Link>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              className="relative bg-surface border border-border group/card transition-all duration-500 hover:border-border-gold flex flex-col"
            >
             <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover/card:w-full transition-all duration-700" />

              {/* Card Header — Artist + Client + Status */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">

                  {/* Artist */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={booking.artist.profile}
                      className="h-9 w-9 object-cover border border-border flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Artist</p>
                      <p className="text-text text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {booking.artist.name}
                      </p>
                    </div>
                  </div>

                  {/* Client */}
                  {booking.bussiness && (
                    <>
                      <div className="h-8 w-px bg-border flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={booking.client.profile}
                          className="h-9 w-9 object-cover border border-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Client</p>
                          <p className="text-text text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {booking.client.name}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`flex-shrink-0 text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 ${statusStyle[booking.status] ?? "border border-border text-text-muted"}`}>
                  {booking.status}
                </span>
              </div>

              {/* Card Body */}
              {booking.status !== "appointment" ? (
                <div className="flex gap-4 p-5">
                  {/* Tattoo Image */}
                  <img
                    src={booking.tattooImg}
                    className="w-28 h-36 object-cover border border-border flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 space-y-3 min-w-0">

                    {/* Price / Balance */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                        <PhilippinePeso className="w-3 h-3 text-gold" />
                        {booking.status === "completed" ? "Price" : "Balance"}
                      </p>
                      {booking.status === "completed" ? (
                        <p className="text-gold text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          ₱{booking.originalPrice.toLocaleString()}
                        </p>
                      ) : booking.balance <= 0 ? (
                        <span className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 bg-success-muted text-success-light border border-success-border">
                          Fully Paid
                        </span>
                      ) : (
                        <p className="text-gold text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          ₱{booking.balance.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gold" /> Date
                      </p>
                      <p className="text-text-muted text-xs">{booking.date}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gold" /> Duration
                      </p>
                      <p className="text-text-muted text-xs">
                        {booking.duration} {booking.duration !== 1 ? "hrs" : "hr"}
                      </p>
                    </div>

                    {/* Time Slot */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gold" /> Time
                      </p>
                      <p className="text-text-muted text-xs">
                        {convertToAmPm(booking.time[0])} – {convertToAmPm(booking.time[booking.time.length - 1])}
                      </p>
                    </div>

                    {/* Session Progress */}
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-gold" /> Session
                      </p>
                      <div className="flex gap-1">
                        {booking.sessions.map((_, i) => (
                          <div
                            key={i}
                            className={`w-5 h-2 border border-gold ${i < booking.session ? "bg-gold" : "bg-transparent"}`}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* Appointment layout */
                <div className="grid grid-cols-3 gap-px bg-border">
                  <div className="bg-surface px-4 py-5">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-3 h-3 text-gold" /> Date
                    </p>
                    <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {booking.date}
                    </p>
                  </div>

                  <div className="bg-surface px-4 py-5">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3 h-3 text-gold" /> Duration
                    </p>
                    <p className="text-text text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {booking.duration} {booking.duration !== 1 ? "hrs" : "hr"}
                    </p>
                  </div>

                  <div className="bg-surface px-4 py-5">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3 h-3 text-gold" /> Time
                    </p>
                    <p className="text-text text-xs font-light">
                      {convertToAmPm(booking.time[0])} –{" "}
                      {convertToAmPm(booking.time[booking.time.length - 1])}
                    </p>
                  </div>
                </div>
              )}

              {/* Card Footer — Actions */}
              <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-border mt-auto not-group">

                {booking.status === "appointment" && (
                  <Button
                  
                    onClick={() => completeAppointmentHandler(booking._id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}

                {booking.session !== booking.sessions.length && booking.status === "active" && (
                  <BookNextSession booking={booking} key={index} />
                )}

                {(booking.status === "active" && booking.originalPrice > booking.balance) && (
                  <Button      
                    hoverText={"Refund"}      
                      onClick={() => handleRefund(booking)}
                    >
                    <RotateCw className="w-3.5 h-3.5" />
                  </Button>
                )}


                {booking.session === booking.sessions.length && booking.status === "active" && (
                  <Button
                    hidden={booking.balance !== 0}
                    hoverText={"Mark as Complete"}
                    onClick={() => handleComplete(booking)}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}

                {booking.tattooData && (
                  <ViewTattoo3DModal
                    key={booking._id}
                    tattooData={booking.tattooData}
                    booking={booking}
                    img={booking.tattooImg}
                    rejectCallback={booking.status === "pending" ? handleReject : null}
                    approveCallback={booking.status === "pending" ? handleApprove : null}
                  />
                )}

                {booking.status === "active" && (
                  <ReschedModal refetch={refetch} booking={booking} />
                )}

              </div>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="relative border border-border bg-surface p-16 text-center">
            <div className="pointer-events-none absolute top-0 left-0 w-12 h-12 border-t border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute top-0 right-0 w-12 h-12 border-t border-r border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold opacity-40" />
            <p
              className="text-4xl font-light text-text-dim mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No {type} bookings
            </p>
            <p className="text-text-muted text-sm">Your {type} bookings will appear here</p>
          </div>
        )}

      </div>
    </div>
    </BookingContext.Provider>
  );
}
