"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useState, useEffect, useRef } from "react";
import { convoInterface } from "@/app/types/convo.type";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorAlert } from "@/app/utils/alert";
import useUserStore from "@/app/store/useUserStore";
import { Send } from "lucide-react";
import { UploadImageModal } from "./components/uploadImageModal";

export default function Page() {
  const { user } = useUserStore();

  const [p2Profile, setP2Profile] = useState("");
  const [p2Name, setP2name] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const paramsId = params.id as string;

  const [convo, setConvo] = useState<convoInterface | null>(null);

  const { data } = useQuery({
    queryKey: ["convo"],
    queryFn: () => axiosInstance.get(`/convo/${paramsId}`),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (data?.data) {
      const convoData: convoInterface = data?.data;
      setConvo(convoData);
      const index = user?._id === convoData.accounts[0]._id ? 1 : 0;
      setP2Profile(convoData.accounts[index].profile);
      setP2name(convoData.accounts[index].name);
    }
  }, [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convo?.chats]);

  const [message, setMessage] = useState("");

  const messageMutation = useMutation({
    mutationFn: (data: { convoId: string; message: string }) =>
      axiosInstance.post(`/convo/message`, data),
    onSuccess: (response) => {
      setConvo(response.data);
      setMessage("");
    },
    onError: () => errorAlert("error occured"),
  });

  const handleMessageSend = () => {
    if (!message.trim()) return errorAlert("empty field");
    messageMutation.mutate({ message, convoId: convo!._id });
  };

  if (!convo) return (
    <div className="w-full h-dvh bg-primary flex items-center justify-center">
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
      <p className="text-text-muted text-[10px] uppercase tracking-[0.28em]">Loading...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-dvh w-full bg-primary overflow-hidden">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.06] blur-[120px] bg-gold" />

      {/* Header */}
      <div className="relative flex items-center gap-4 px-6 py-4 border-b border-border bg-surface z-10">
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />

        <div className="relative flex-shrink-0">
          <img
            src={p2Profile}
            alt="profile"
            className="w-10 h-10 object-cover border border-border"
          />
          <div className="absolute -bottom-px -right-px w-2 h-2 bg-gold opacity-60" />
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-gold mb-0.5">Conversation</p>
          <h1
            className="text-lg font-light text-text leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {p2Name}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {convo.chats.map((chat) => {
          const isMe = chat.sender === user?._id;

          return (
            <div
              key={chat._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[70%] text-sm transition-all duration-200 ${
                  chat.type === "text" ? "px-4 py-3" : ""
                } ${
                  isMe
                    ? "bg-gold text-primary border border-gold"
                    : "bg-surface border border-border text-text"
                }`}
              >
                {/* Corner accents for received messages */}
                {!isMe && chat.type === "text" && (
                  <>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold opacity-40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold opacity-40" />
                  </>
                )}

                {chat.type === "text" && (
                  <p className="text-[13px] leading-relaxed tracking-wide">{chat.message}</p>
                )}

                {chat.type === "image" && (
                  <img
                    src={chat.url}
                    alt="sent"
                    className="max-h-64 object-cover border border-border"
                  />
                )}

                {chat.type === "video" && (
                  <video
                    src={chat.url}
                    controls
                    className="max-h-64 border border-border"
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-border bg-surface px-5 py-4 flex items-center gap-3 z-10">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />

        <UploadImageModal convoId={convo._id} setConvo={setConvo} />

        <input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
          className="flex-1 bg-transparent border-b border-border focus:border-gold outline-none text-text text-sm py-2 placeholder:text-text-muted placeholder:text-[11px] placeholder:uppercase placeholder:tracking-[0.15em] transition-colors duration-200"
        />

        <button
          onClick={handleMessageSend}
          disabled={messageMutation.isPending}
          className="flex-shrink-0 w-9 h-9 border border-border text-text-muted hover:border-gold hover:text-gold transition-all duration-200 flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}