"use client";
import useUserStore from "@/app/store/useUserStore";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { artistInfoInterface } from "@/app/types/accounts.type";
import { postInterface } from "@/app/types/post.type";
import { ChangeProfile } from "./components/changeProfile";
import MapLocation from "./components/location";
import { ArtistVerifiactionModal } from "./components/artistVerificationModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BussinessVerifiactionModal } from "./components/bussinessVerificationModal";
import LoadingScreen from "@/components/ui/loadingScreen";
import { bookingInterface } from "@/app/types/booking.type";
import { ClockIcon, UserCheckIcon, CalendarIcon, CheckCircleIcon, MailIcon, PhoneIcon } from "lucide-react";

export default function Page() {

  const { user, setUser } = useUserStore()

  const [clientBooking, setClientBooking] = useState({
    pending: 0,
    active: 0,
    appointment: 0
  })

  const { data } = useQuery({
    queryKey: ['account'],
    queryFn: () => axiosInstance.get(`/account/${user?._id}`),
    refetchInterval: 5000
  })

  const { data: bookings } = useQuery({
    queryKey: ['client_booking'],
    queryFn: () => axiosInstance.get(`/booking/client/${user?._id}`),
    refetchInterval: 5000
  })

  useEffect(() => {
    if (data?.data) {
      setUser(data.data)
    }
  }, [data])

  useEffect(() => {
    if (bookings?.data) {
      const booking : bookingInterface[] = bookings?.data
      setClientBooking({
        pending: booking.filter(item => item.status == "pending").length,
        active: booking.filter(item => item.status == "active").length,
        appointment: booking.filter(item => item.status == "appointment").length
      })
    }
  }, [bookings])

  if (!user || !bookings) return <LoadingScreen />

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10  space-y-16">

   
        {/* User Info Card */}
        <div className="relative w-full flex flex-col md:flex-row gap-10 bg-surface border border-border p-10 group transition-all duration-500 hover:border-border-gold overflow-hidden">
          {/* Gold bottom line reveal */}
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

          {/* Profile Image */}
          <div className="flex justify-center md:justify-start md:items-start pt-1">
            <ChangeProfile profile={user.profile} />
          </div>

          {/* User Details */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold mb-3">Account Holder</p>
              <h1
                className="text-5xl lg:text-6xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {user.name}
              </h1>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                  <MailIcon className="w-3.5 h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Email Address</p>
                  <p className="text-text text-sm">{user.email || "No email available"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-3.5 h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Contact Number</p>
                  <p className="text-text text-sm">{user.contact || "No contact available"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      

        {/* Bookings Summary */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Booking Overview</span>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Pending */}
            <div className="relative bg-surface border border-border p-8 flex flex-col items-start gap-4 group transition-all duration-500 hover:border-border-gold overflow-hidden">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <span
                className="absolute top-4 right-5 text-7xl font-light text-text-dim leading-none select-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >01</span>
              <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-gold" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Pending</p>
                <p
                  className="text-5xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {clientBooking.pending}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">Bookings awaiting approval</p>
              </div>
            </div>

            {/* Active */}
            <div className="relative bg-surface border border-border p-8 flex flex-col items-start gap-4 group transition-all duration-500 hover:border-border-gold overflow-hidden">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <span
                className="absolute top-4 right-5 text-7xl font-light text-text-dim leading-none select-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >02</span>
              <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-gold" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Active</p>
                <p
                  className="text-5xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {clientBooking.active}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">Bookings currently in progress</p>
              </div>
            </div>

            {/* Appointment */}
            <div className="relative bg-surface border border-border p-8 flex flex-col items-start gap-4 group transition-all duration-500 hover:border-border-gold overflow-hidden">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <span
                className="absolute top-4 right-5 text-7xl font-light text-text-dim leading-none select-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >03</span>
              <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-gold" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Appointments</p>
                <p
                  className="text-5xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {clientBooking.appointment}
                </p>
                <p className="text-text-muted text-sm leading-relaxed">Scheduled appointments</p>
              </div>
            </div>

          </div>
          
        </div>


       

      </div>
    </div>
  )
}