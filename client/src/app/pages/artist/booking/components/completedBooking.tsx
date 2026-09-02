"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  PhilippinePeso
} from "lucide-react";

const statusStyle: Record<string, string> = {
    pending:     "bg-warning-muted text-warning-light border border-warning-border",
    completed:   "bg-success-muted text-success-light border border-success-border",
    rejected:    "bg-danger-muted text-danger-light border border-danger-border",
    active:      "bg-info-muted text-info-light border border-info-border",
    appointment: "border border-border text-text-muted bg-surface-alt",
  };

export default function CompletedBookings({ bookings, setBookings } : {bookings : bookingInterface[], setBookings : (data : bookingInterface[]) => void}) {

  return (
    <>
     {/* Bookings Grid */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
                      {/* Price */}
                      <div className="flex justify-between">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                          <PhilippinePeso className="w-3 h-3 text-gold" /> Price
                        </p>
                        <p className="text-gold text-sm font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          ₱{booking.originalPrice.toLocaleString()}
                        </p>
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
                          <Clock className="w-3 h-3 text-gold" /> Time Slot
                        </p>
                        <p className="text-text-muted text-xs">
                          {convertToAmPm(booking.time[0])} – {convertToAmPm(booking.time[booking.time.length - 1])}
                        </p>
                      </div>
      
                      {/* Session Progress */}
                      <div className="flex justify-between">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-gold" /> Session
                        </p>
                        <div className="flex gap-2">
                          {booking.sessions.map((_, index) => (
                            <div
                              key={index}
                              className={`w-5 h-2 border border-gold ${index < booking.session ? "bg-gold" : "bg-transparent"}`}
                            />
                          ))}
                        </div>
                      </div>
      
                    </div>
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
                  No bookings found
                </p>
                <p className="text-text-muted text-sm">Booking requests will appear here</p>
              </div>
            )}
    </>
  );
}
