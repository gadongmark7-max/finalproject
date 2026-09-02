"use client";
import { useMutation } from "@tanstack/react-query";
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
  Plus,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { BookingContext } from "../page";
import Link from "next/link";

export default function AppointmentBookings({ bookings, setBookings } : {bookings : bookingInterface[], setBookings : (data : bookingInterface[]) => void}) {

    const refetch = useContext(BookingContext)

    const completeAppointmentMutation = useMutation({
        mutationFn : (id : string) => axiosInstance.delete(`/booking/appointment/${id}`),
        onSuccess : () => {
          successAlert("mark as done")
          refetch()
        },
        onError : () => errorAlert("error accour")
      })
    
    
    
      const completeAppointmentHandler = (id : string) => {
        confirmAlert("you want to mark as done this appointment?", "mark as done", () => {
            completeAppointmentMutation.mutate(id)
        })
      }

     
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex flex-col"
            >
              {/* Gold bottom line reveal */}
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
    
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
                <span className="flex-shrink-0 text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 border border-border text-text-muted bg-surface-alt">
                  {booking.status}
                </span>
              </div>
    
              {/* Card Body — Appointment details */}
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
    
              {/* Card Footer — Actions */}
              <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-border mt-auto">
                <Link href={`/pages/artist/addBooking/new/${booking._id}`}>
                  <Button>
                    <Plus className="w-3.5 h-3.5" /> Create Session
                  </Button>
                </Link>
    
                <Button
                  className="bg-danger-muted text-danger-light border border-danger-border hover:bg-danger/10 hover:text-danger-light hover:border-danger"
                  onClick={() => completeAppointmentHandler(booking._id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
    
            </div>
          ))}
    
        </div>
      );
}
