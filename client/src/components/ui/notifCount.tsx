"use client"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { notificationInterface } from "@/app/types/notification.type";

export default function NotificationsCount() {

    const { data: notifications } = useQuery({
        queryKey: ["unseen-notif"],
        queryFn: async (): Promise<notificationInterface[]> => {
          const response = await axiosInstance.get(`/account/notifications/unseen`);
          return response.data;
        },
    });

    if(!notifications || notifications.length === 0) return null

    return(
        <span className="scale-90 flex-shrink-0 text-[9px] mt-1 uppercase tracking-[0.15em] px-2 py-1 font-bold leading-none text-warning-light bg-warning-muted border border-warning-border rounded-full">
        {notifications?.length}
        </span>
    )
}