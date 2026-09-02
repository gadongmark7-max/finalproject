"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, createContext } from "react";
import axiosInstance from "@/app/utils/axios";
import useUserStore from "@/app/store/useUserStore";
import { bookingInterface } from "@/app/types/booking.type";
import ActiveBookings from "./components/activeBooking";
import CompletedBookings from "./components/completedBooking";
import PendingBookings from "./components/pendingBooking";
import { Plus } from "lucide-react";
import Link from "next/link";
import AppointmentBookings from "./components/appointmentBooking";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { isBussinessApproveArtistAppoitnment } from "@/app/utils/customFunction";
import LoadingScreen from "@/components/ui/loadingScreen";

export const BookingContext = createContext<() => void>(() => {});

const STATUS_TABS = ["active", "pending", "appointment", "completed"] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function Page() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<bookingInterface[]>([]);
  const [type, setType] = useState<StatusTab>("active");

  const { data: artistBussinesses } = useQuery({
    queryKey: ["bussiness_Infos"],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/artistBussiness/${user?._id}`);
      return response.data;
    },
  });

  const { data, refetch } = useQuery({
    queryKey: ["artist_booking"],
    queryFn: () => axiosInstance.get(`/booking/artist/${user?._id}`),
  });

  useEffect(() => {
    if (data?.data) setBookings(data.data.reverse());
  }, [data]);

  if (!artistBussinesses) return <LoadingScreen />;

  const countOf = (status: StatusTab) =>
    bookings.filter((b) => b.status === status).length;

  return (
    <BookingContext.Provider value={refetch}>
      <div className="w-full min-h-dvh bg-primary overflow-auto">

        {/* Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient Gold Glow */}
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-10">

          {/* Page Header */}
          <div className="flex items-start justify-between gap-6 flex-wrap">

            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Artist Panel
                </span>
              </div>
              <h1
                className="text-5xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                My Bookings
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {isBussinessApproveArtistAppoitnment(artistBussinesses) && (
                <Link href="/pages/artist/appointment">
                  <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-gold text-gold hover:bg-gold hover:text-primary transition-all duration-200">
                    <Plus className="w-3.5 h-3.5" />
                    Add Appointment
                  </button>
                </Link>
              )}
              <Link href="/pages/artist/addBooking/new/none">
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] px-5 py-3 border border-border text-text-muted hover:border-border-gold hover:text-text transition-all duration-200">
                  <Plus className="w-3.5 h-3.5" />
                  Add Sessions
                </button>
              </Link>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-6">
            {STATUS_TABS.map((tab) => {
              const count = tab !== "completed" ? countOf(tab) : null;
              const isActive = type === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setType(tab)}
                  className={`flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-200 ${
                    isActive
                      ? "border-gold text-gold bg-surface-alt"
                      : "border-border text-text-muted hover:border-border-gold hover:text-text"
                  }`}
                >
                  {tab}
                  {count !== null && (
                    <span
                      className={`text-[9px] min-w-[18px] text-center px-1 py-0.5 border transition-all duration-200 ${
                        isActive
                          ? "border-gold text-gold"
                          : "border-border text-text-muted"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Booking Views */}
          {type === "active" && (
            <ActiveBookings
              setBookings={setBookings}
              bookings={bookings.filter((b) => b.status === "active")}
            />
          )}
          {type === "pending" && (
            <PendingBookings
              setBookings={setBookings}
              bookings={bookings.filter((b) => b.status === "pending")}
            />
          )}
          {type === "completed" && (
            <CompletedBookings
              setBookings={setBookings}
              bookings={bookings.filter((b) => b.status === "completed")}
            />
          )}
          {type === "appointment" && (
            <AppointmentBookings
              setBookings={setBookings}
              bookings={bookings.filter((b) => b.status === "appointment")}
            />
          )}

        </div>
      </div>
    </BookingContext.Provider>
  );
}