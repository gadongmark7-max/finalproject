"use client"
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { bookingInterface } from "@/app/types/booking.type";
import useUserStore from "@/app/store/useUserStore";
import { convertToAmPm } from "@/app/utils/customFunction";
import { Clock, Calendar, DollarSignIcon, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CashPayment } from "./components/cashPayment";
import SubscriptionExpired from "@/components/ui/subscriptionExpired"
import { checkIfSubsExpired } from "@/app/utils/customFunction"

export default function Page() {

    const {user} = useUserStore()
    const [bookings, setBookings] = useState<bookingInterface[]>([]);

    const { data, refetch } = useQuery({
        queryKey: ["bussiness_booking"],
        queryFn: () => axiosInstance.get(`/booking/bussiness/${user?._id}`),
    });

    useEffect(() => {
        if (data?.data){
            setBookings(data.data.filter((e : bookingInterface) => e.status == "active" && e.balance > 0))
        }
    }, [data]);

    if(checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />

    return (
        <div className="w-full min-h-dvh bg-primary">

            {/* Grain overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />

            {/* Ambient gold glow */}
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

                {/* Page Header */}
                <div className="border-b border-border pb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px w-8 bg-gold" />
                        <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Operations</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h1
                                className="text-4xl font-light text-text tracking-[-0.02em]"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            >
                                Cash Payments
                            </h1>
                            <p className="text-sm text-text-muted leading-relaxed mt-2">
                                Active bookings with outstanding balances awaiting collection
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-surface-alt border border-border p-3">
                                <Banknote className="w-4 h-4 text-gold" />
                            </div>
                            <div>
                                <p className="text-2xl font-light text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {bookings.length}
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                    {bookings.map((booking, index) => (
                        <div
                            key={booking._id}
                            className="group relative bg-surface border-0 p-6 space-y-5 hover:bg-surface-alt transition-all duration-500"
                        >
                            {/* Gold bottom reveal */}
                            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                     
                     
                        
               
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={booking.artist.profile}
                                            className="h-10 w-10 object-cover border border-border group-hover:border-gold transition-all duration-500"
                                            style={{ borderRadius: 0 }}
                                        />
                                    </div>



                                    <div className="flex flex-col">
                                        <span className="text-sm font-light text-text tracking-wide truncate max-w-[100px]">
                                            {booking.artist.name}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">Artist</span>
                                    </div>
                                </div>


                        

                                {booking.bussiness && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-light text-text tracking-wide truncate max-w-[100px]">
                                                {booking.client.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">Client</span>
                                        </div>
                                        <img
                                            src={booking.client.profile}
                                            className="h-10 w-10 object-cover border border-border group-hover:border-gold transition-all duration-500"
                                            style={{ borderRadius: 0 }}
                                        />
                                    </div>
                                )}
                            </div>


                        

                            {/* Divider */}
                            <div className="border-t border-border" />

                            {/* Booking Details */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-gold" />
                                        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Date</span>
                                    </div>
                                    <p className="text-sm font-light text-text leading-snug">{booking.date}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-gold" />
                                        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Duration</span>
                                    </div>
                                    <p className="text-sm font-light text-text">
                                        {booking.duration} {booking.duration != 1 ? "hrs" : "hr"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-gold" />
                                        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Slot</span>
                                    </div>
                                    <p className="text-xs font-light text-text-muted leading-snug">
                                        {convertToAmPm(booking.time[0])} –{" "}
                                        {convertToAmPm(booking.time[booking.time.length - 1])}
                                    </p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-1 flex gap-2 justify-between mt-5 mb-3">

                                       {/* Balance Badge */}
                            <div className="flex items-center gap-2 border border-gold bg-secondary px-3 py-2 w-fit">
                                        
                                        <span
                                            className="text-gold font-light tracking-wide"
                                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
                                        >
                                            ₱ {booking.balance.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gold uppercase tracking-[0.18em]  ml-1">Balance</span>
                                    </div>


                                <CashPayment refetch={refetch} booking={booking} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {bookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 border border-border bg-secondary relative">
                        <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold opacity-40" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold opacity-40" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold opacity-40" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold opacity-40" />
                        <Banknote className="w-8 h-8 text-text-dim mb-4" />
                        <p
                            className="text-2xl font-light text-text-muted mb-2"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            No Pending Payments
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-text-dim">All balances have been settled</p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-6">
                    <p className="text-[10px] uppercase tracking-widest text-text-dim">
                        {bookings.length} active {bookings.length !== 1 ? 'bookings' : 'booking'} pending
                    </p>
                    <div className="h-px w-24 bg-border" />
                </div>

            </div>
        </div>
    );
}