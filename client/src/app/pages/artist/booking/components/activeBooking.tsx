"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
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
  Check,
  PhilippinePeso,
  RotateCw
} from "lucide-react";
import { BookNextSession } from "./nextSessionBooking";
import { Session } from "inspector/promises";
import { Button } from "@/components/ui/button";
import { successAlert, confirmAlert, errorAlert } from "@/app/utils/alert";
import { CashPayment } from "./cashPayment";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { isBussinessApproveArtistPayment } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";
import { ReschedModal } from "./reschedModal";
import { payMongoRefund } from "@/app/utils/payMongo";



const statusStyle: Record<string, string> = {
    pending:     "bg-warning-muted text-warning-light border border-warning-border",
    completed:   "bg-success-muted text-success-light border border-success-border",
    rejected:    "bg-danger-muted text-danger-light border border-danger-border",
    active:      "bg-info-muted text-info-light border border-info-border",
    appointment: "border border-border text-text-muted bg-surface-alt",
  };

export default function ActiveBookings({ bookings, setBookings } : {bookings : bookingInterface[], setBookings : (data : bookingInterface[]) => void}) {

    const {user} = useUserStore()

    const [isLoading, setIsLoading] = useState(false)

    const { data: bussinessInfos } = useQuery({
        queryKey: ["bussiness_Infos"],
        queryFn: async (): Promise<bussinessInfoInterface[]> => {
        const response = await axiosInstance.get(`/account/artistBussiness/${user?._id}`);
        return response.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn : (data :  {id  :string , status : string}) => axiosInstance.put(`/booking/status`, data),
        onSuccess : (response) => {
            setBookings(response.data)
            successAlert("status updated")
        },
        onError : () => errorAlert("ERROR ACCOUR")
      })

      const handleComplete = (id : string) => {
        confirmAlert("this session is complete?", "complete", () => {
            updateStatusMutation.mutate({id, status : "completed"})
        })
      }


      const refundMutation = useMutation({
        mutationFn : (data :  {id  :string , status : string, reason : string, clientId : string }) => axiosInstance.put(`/booking/status`, data),
        onSuccess : (response) => {
            setBookings(response.data)
        },
        onError : () => errorAlert("ERROR ACCOUR")
      })

      const handleRefund = (booking : bookingInterface) => {
          confirmAlert("you want to Refund this Booking?", "Refund", () => {
            refundMutation.mutate({
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






      if(!bussinessInfos || isLoading) return <LoadingScreen />

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="relative bg-surface border border-border group/card transition-all duration-500 hover:border-border-gold flex flex-col"
            >
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover/card:w-full transition-all duration-700" />
            
              {/* Card Header — Client + Business + Status */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
    
                  {/* Client */}
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
    
                  {/* Business */}
                  {booking.bussiness && (
                    <>
                      <div className="h-8 w-px bg-border flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={booking.bussiness.profile}
                          className="h-9 w-9 object-cover border border-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gold">Studio</p>
                          <p className="text-text text-sm font-light truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            {booking.bussiness.name}
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
              <div className="flex gap-4 p-5">
                {/* Tattoo Image */}
                <img
                  src={booking.tattooImg}
                  className="w-28 h-36 object-cover border border-border flex-shrink-0"
                />
    
                {/* Details */}
                <div className="flex-1 space-y-3 min-w-0">
    
                  {/* Balance */}
                  <div className="flex justify-between">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                      <PhilippinePeso className="w-3 h-3 text-gold" /> Balance
                    </p>
                    {booking.balance <= 0 ? (
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
    
              {/* Card Footer — Actions */}
              <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-border mt-auto">
                {booking.session !== booking.sessions.length
                  ? <BookNextSession booking={booking} setBookings={setBookings} />
                  : (
                    <Button
                      hidden={booking.balance !== 0}
                      hoverText={"Mark as Complete"}
                      onClick={() => handleComplete(booking._id)}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )
                }
    
                {(booking.balance !== 0 && isBussinessApproveArtistPayment(booking.bussiness?._id, bussinessInfos)) && (
                  <CashPayment booking={booking} key={booking._id + booking.balance} />
                )}
    
                {booking.tattooData && (
                  <ViewTattoo3DModal
                    key={booking._id}
                    booking={booking}
                    tattooData={booking.tattooData}
                    img={booking.tattooImg}
                  />
                )}

                {(booking.status === "active" && booking.originalPrice > booking.balance && isBussinessApproveArtistPayment(booking.bussiness?._id, bussinessInfos)) && (
                  <Button      
                    hoverText={"Refund"}      
                      onClick={() => handleRefund(booking)}
                    >
                    <RotateCw className="w-3.5 h-3.5" />
                  </Button>
                )}
    
                <ReschedModal booking={booking} setBookings={setBookings} />
              </div>
    
            </div>
          ))}
    
        </div>
      );
}
