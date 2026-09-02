"use client";

import axiosInstance from "@/app/utils/axios";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/app/store/useUserStore";
import { notificationInterface } from "@/app/types/notification.type";
import { CheckCircle, AlertTriangle, Bell, BellOff } from "lucide-react";

export default function Page() {
  const { user } = useUserStore();

  const { data: notificationData } = useQuery({
    queryKey: ["notifications", user?._id],
    enabled: !!user?._id,
    queryFn: async (): Promise<notificationInterface[]> => {
      const response = await axiosInstance.get(`/account/notifications/${user?._id}`);
      return response.data;
    },
  });

  const successCount = notificationData?.filter(n => n.type === "success").length ?? 0;
  const alertCount = notificationData?.filter(n => n.type !== "success").length ?? 0;

  return (
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

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 space-y-10">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              Updates
            </span>
          </div>
          <h1
            className="text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Notifications
          </h1>
        </div>

        {/* Notification List */}
        {notificationData && notificationData.length > 0 && (
          <div className="space-y-3">
            {notificationData.map((notif, index) => {
              const isSuccess = notif.type === "success";

              return (
                <div
                  key={index}
                  className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex items-start gap-4 px-5 py-4"
                >
                  {/* Gold bottom line reveal */}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 w-[2px] h-full ${isSuccess ? "bg-success-light" : "bg-red-500"} opacity-60`} />

                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 ${isSuccess ? "text-success-light" : "text-red-400"}`}>
                    {isSuccess
                      ? <CheckCircle className="w-4 h-4" />
                      : <AlertTriangle className="w-4 h-4" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-text text-sm font-light leading-relaxed"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {notif.message}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted mt-1.5">
                      {notif.date} · {notif.time}
                    </p>
                  </div>

                  {/* Type badge */}
                  <span className={`flex-shrink-0 text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border ${
                    isSuccess
                      ? "border-success-border text-success-light bg-success-muted"
                      : "border-red-500/30 text-red-400 bg-red-500/5"
                  }`}>
                    {notif.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!notificationData?.length && (
          <div className="relative border border-border bg-surface p-16 text-center">
            <div className="pointer-events-none absolute top-0 left-0 w-12 h-12 border-t border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute top-0 right-0 w-12 h-12 border-t border-r border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold opacity-40" />
            <Bell className="w-8 h-8 text-gold opacity-30 mx-auto mb-4" />
            <p
              className="text-4xl font-light text-text-dim mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No notifications
            </p>
            <p className="text-text-muted text-sm">You're all caught up</p>
          </div>
        )}

      </div>
    </div>
  );
}