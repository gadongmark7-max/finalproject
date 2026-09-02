"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useState, useEffect } from "react";
import { convoInterface } from "@/app/types/convo.type";
import Link from "next/link";
import useUserStore from "@/app/store/useUserStore";
import { getChatIndex } from "@/app/utils/customFunction";
import { MessageSquare } from "lucide-react";

export default function Page() {
  
  const {user} = useUserStore()
  
  const [convos, setConvos] = useState<convoInterface[]>([])

  const { data } = useQuery({
    queryKey : ['convos'],
    queryFn : () => axiosInstance.get(`/convo`)
  })

  useEffect(() => {
    if(data?.data) setConvos(data?.data)
  }, [data])


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
              Inbox
            </span>
          </div>
          <h1
            className="text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Conversations
          </h1>
        </div>

        {/* Convo List */}
        {convos.length > 0 && (
          <div className="space-y-3">
            {convos.map((convo) => {
              const index = user?._id === convo.accounts[0]._id ? 1 : 0;
              const other = convo.accounts[index];

              return (
                <Link
                  key={convo._id}
                  href={`/pages/artist/convo/${convo._id}`}
                  className="block"
                >
                  <div className="relative bg-surface border border-border group transition-all duration-500 hover:border-border-gold flex items-center gap-4 px-5 py-4">

                    {/* Gold bottom line reveal */}
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={other?.profile}
                        alt="profile"
                        className="w-11 h-11 object-cover border border-border"
                      />
                      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-text text-sm font-light mb-0.5 truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {other?.name}
                      </p>
                      <p className="text-[11px] text-text-muted truncate tracking-wide">
                        {convo.lastMessage || "No messages yet"}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-border group-hover:text-gold transition-colors duration-300">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
                      </svg>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {convos.length === 0 && (
          <div className="relative border border-border bg-surface p-16 text-center">
            <div className="pointer-events-none absolute top-0 left-0 w-12 h-12 border-t border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute top-0 right-0 w-12 h-12 border-t border-r border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-12 h-12 border-b border-l border-gold opacity-40" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold opacity-40" />
            <MessageSquare className="w-8 h-8 text-gold opacity-30 mx-auto mb-4" />
            <p
              className="text-4xl font-light text-text-dim mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No conversations yet
            </p>
            <p className="text-text-muted text-sm">Your messages will appear here</p>
          </div>
        )}

      </div>
    </div>
  );
  
}
