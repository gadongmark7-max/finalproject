"use client"
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, BadgeDollarSign, CalendarDays, FileText, Building2 } from "lucide-react";

export default function Page() {

  const { user } = useUserStore();

  const { data: bussinessInfos } = useQuery({
    queryKey: ["bussiness_Infos"],
    queryFn: async (): Promise<bussinessInfoInterface[]> => {
      const response = await axiosInstance.get(`/account/artistBussiness/${user?._id}`);
      return response.data;
    },
  });

  if (!bussinessInfos) return <LoadingScreen />;

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[300px] lg:h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* Page Title */}
        <div className="mb-12 border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Artist Portal</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            My Businesses
          </h1>
          <p className="text-text-muted text-sm mt-3 leading-relaxed">
            Manage your studio affiliations, schedules, and earnings in one place.
          </p>
        </div>

        {/* Grid */}
        {bussinessInfos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-border bg-surface">
            <div className="w-12 h-12 bg-surface-alt border border-border flex items-center justify-center">
              <Building2 size={20} className="text-text-dim" />
            </div>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.28em]">No affiliated businesses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bussinessInfos.map((item, index) => (
              <div
                key={item._id}
                className="group relative bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden"
              >
                {/* Gold bottom reveal */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                {/* Ghost Number */}
                <span
                  className="absolute top-3 right-4 text-6xl font-light text-text-dim leading-none select-none pointer-events-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Header — Logo + Name */}
                <div className="p-5 border-b border-border flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-[2px] border border-gold opacity-25" />
                    <img
                      src={item.bussiness.profile}
                      alt="Business Logo"
                      className="w-14 h-14 object-cover"
                    />
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">Studio</p>
                    <h2
                      className="text-xl font-light text-text tracking-[-0.01em] truncate"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {item.bussiness.name}
                    </h2>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 space-y-2">

                  <Link href={`/pages/artist/myAttendance/${item.bussiness._id}`} className="block">
                    <Button className="w-full justify-start gap-3">
                      <div className="w-5 h-5 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                        <Clock size={10} className="text-gold" />
                      </div>
                      Time In / Time Out
                    </Button>
                  </Link>

                  <Button className="w-full justify-start gap-3">
                    <div className="w-5 h-5 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                      <BadgeDollarSign size={10} className="text-gold" />
                    </div>
                    Commissions
                  </Button>

                  <Button className="w-full justify-start gap-3">
                    <div className="w-5 h-5 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={10} className="text-gold" />
                    </div>
                    Schedule
                  </Button>

                  <Link href={`/pages/artist/payslip?business=${item.bussiness._id}`} className="block">
                    <Button className="w-full justify-start gap-3">
                      <div className="w-5 h-5 bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                        <FileText size={10} className="text-gold" />
                      </div>
                      Payslip
                    </Button>
                  </Link>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">Ink Of Baphomet Atelier</span>
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-text-dim whitespace-nowrap">Artist Portal</span>
        </div>

      </div>
    </div>
  );
}