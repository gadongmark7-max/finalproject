"use client"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { adminMessageInterface } from "@/app/types/adminMessage.type";

export default function AdminMessagesCount() {

    const { data: adminMessages } = useQuery({
        queryKey: ["unseen-adminMessage"],
        queryFn: async (): Promise<adminMessageInterface[]> => {
          const response = await axiosInstance.get(`/account/adminMessage/unseen`);
          return response.data;
        },
    });

    if(!adminMessages || adminMessages.length === 0) return null

    return(
        <span className="scale-90 flex-shrink-0 text-[9px] mt-1 uppercase tracking-[0.15em] px-2 py-1 font-bold leading-none text-warning-light bg-warning-muted border border-warning-border rounded-full">
        {adminMessages?.length}
        </span>
    )
}