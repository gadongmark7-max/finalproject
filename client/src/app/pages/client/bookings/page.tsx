"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import { convertToAmPm } from "@/app/utils/customFunction";
import {
  Calendar,
  Clock,
  Layers,
  PhilippinePeso,
} from "lucide-react";
import { ReviewModal } from "./components/reviews";
import { Button } from "@/components/ui/button";
import { OnlinePayment } from "./components/onlinePayment";
import { ViewTattoo3DModal } from "@/app/3d/3dTattooView";
import crypto from "crypto";


const STATUS_TABS = ["active", "appointment", "pending", "completed"] as const;

const statusStyle: Record<string, string> = {
  pending:     "bg-warning-muted text-warning-light border border-warning-border",
  completed:   "bg-success-muted text-success-light border border-success-border",
  rejected:    "bg-danger-muted text-danger-light border border-danger-border",
  active:      "bg-info-muted text-info-light border border-info-border",
  appointment: "border border-border text-text-muted bg-surface-alt",
};

export default function Page() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<bookingInterface[]>([]);
  const [type, setType] = useState("active");

  const { data } = useQuery({
    queryKey: ["client_booking"],
    queryFn: () => axiosInstance.get(`/booking/client/${user?._id}`),
  });

  useEffect(() => {
    if (data?.data) {
      setBookings(data.data.filter((e: bookingInterface) => e.status == type).reverse());
    }
  }, [data, type]);

  return (
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
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">My Bookings</span>
          </div>
          <h1
            className="text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Booking History
          </h1>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-6">
          {STATUS_TABS.map((tab) => (
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

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="relative bg-surface border border-border group/card transition-all duration-500 hover:border-border-gold flex flex-col"
            >
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover/card:w-full transition-all duration-700" />

              {/* Card Header — Artist + Business + Status */}
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
              {booking.status !== "appointment" ? (
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
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-1">
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
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3 h-3 text-gold" /> Date
                      </p>
                      <p className="text-text-muted text-xs">{booking.date}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-0.5">
                        <Clock className="w-3 h-3 text-gold" /> Duration
                      </p>
                      <p className="text-text-muted text-xs">
                        {booking.duration} {booking.duration !== 1 ? "hrs" : "hr"}
                      </p>
                    </div>

                    {/* Time Slot */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-0.5">
                        <Clock className="w-3 h-3 text-gold" /> Time Slot
                      </p>
                      <p className="text-text-muted text-xs">
                        {convertToAmPm(booking.time[0])} – {convertToAmPm(booking.time[booking.time.length - 1])}
                      </p>
                    </div>

                    {/* Session Progress */}
                    <div className="flex justify-between">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted flex items-center gap-1.5 mb-0.5">
                        <Layers className="w-3 h-3 text-gold" /> Session
                      </p>
                 

                    <div className="flex gap-2 ">
                        {booking.sessions.map((_, index) => (
                            <div
                            key={index}
                            className={`w-5 h-2 border border-gold 
                                ${index < booking.session ? "bg-gold" : "bg-transparent"}
                            `}
                            />
                        ))}
                    </div>

                    </div>

                  </div>
                </div>
              ) : (
                /* Appointment layout */
                <div className="grid grid-cols-3 gap-px bg-border p-0">
                  <div className="bg-surface px-4 py-5 ">
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
              {(
                (booking.status === "completed" && !booking.isReviewed) ||
                booking.balance !== 0 ||
                booking.tattooData
              ) && (
                <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-border mt-auto">
                  {booking.status === "completed" && !booking.isReviewed && (
                    <ReviewModal key={booking._id} booking={booking} setBookings={setBookings} />
                  )}
                  {booking.balance !== 0 && (
                    <OnlinePayment key={booking._id} booking={booking} />
                  )}
                  {booking.tattooData && (
                    <ViewTattoo3DModal booking={booking} key={booking._id + crypto.randomBytes(8).toString("hex")} tattooData={booking.tattooData} img={booking.tattooImg} />
                  )}
                </div>
              )}

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
  );
}