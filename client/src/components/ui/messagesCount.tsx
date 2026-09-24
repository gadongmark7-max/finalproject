"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";

export const UNREAD_MESSAGES_KEY = ["unread-messages"];

export default function MessagesCount({
  floating = false,
}: {
  floating?: boolean;
}) {
  const { data: count } = useQuery({
    queryKey: UNREAD_MESSAGES_KEY,
    queryFn: async (): Promise<number> => {
      const response = await axiosInstance.get(`/convo/unread-count`);
      return response.data.count;
    },
    refetchInterval: 15000,
  });

  if (!count) return null;

  if (floating)
    return (
      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-bold leading-none text-warning-light bg-warning-muted border border-warning-border rounded-full">
        {count}
      </span>
    );

  return (
    <span className="scale-90 flex-shrink-0 text-[9px] mt-1 uppercase tracking-[0.15em] px-2 py-1 font-bold leading-none text-warning-light bg-warning-muted border border-warning-border rounded-full">
      {count}
    </span>
  );
}
