"use client";

import { artistVerificationInterface } from "@/app/types/accounts.type";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArtistVerificationModal } from "./components/artistVerificationModal";
import { BussinessVerificationModal } from "./components/bussinessVerificationModal";
import { ShieldCheck, Building2, User, ClipboardList, ArrowRight } from "lucide-react";

export default function Page() {
  const [artistVerifications, setArtistVerifications] = useState<artistVerificationInterface[]>([]);

  const { data } = useQuery({
    queryKey: ["artist_verification"],
    queryFn: () => axiosInstance.get(`/account/artistVerification`),
  });

  useEffect(() => {
    if (data?.data) setArtistVerifications(data.data);
  }, [data]);

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Admin Panel</span>
                <div className="h-px w-8 bg-gold opacity-40" />
              </div>
              <div>
                <h1
                  className="text-4xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Verification Requests
                </h1>
                <p className="text-sm text-text-muted leading-relaxed mt-2">
                  Review and approve users requesting artist or business access on Ink Of Baphomet.
                </p>
              </div>
            </div>

            {/* Count badge */}
            <div className="flex items-center gap-4 border border-border bg-surface px-5 py-3 self-start lg:self-auto">
              <div className="w-8 h-8 border border-gold flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Pending Review</p>
                <p
                  className="text-2xl font-light text-gold leading-none mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {artistVerifications.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-4 bg-gold" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Pending Requests</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Empty state */}
        {artistVerifications.length === 0 && (
          <div className="border border-border bg-surface flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border border-border bg-surface-alt flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-text-dim" />
            </div>
            <div className="text-center space-y-1">
              <p
                className="text-xl font-light text-text-muted"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                No pending requests
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-dim">
                All verifications are up to date
              </p>
            </div>
          </div>
        )}

        {/* ── VERIFICATION CARDS ── */}
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {artistVerifications.map((verification, idx) => {
            const isArtist = verification.type === "artist";
            const TypeIcon = isArtist ? User : Building2;

            return (
              <div
                key={verification._id}
                className="group relative bg-surface hover:bg-surface-alt transition-all duration-500 flex flex-col overflow-hidden"
              >
                {/* Gold bottom reveal */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                {/* Ghost index */}
                <span
                  className="absolute top-4 right-5 text-6xl font-light text-text-dim select-none pointer-events-none opacity-40"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Card top: type strip */}
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <div className={`w-5 h-5 flex items-center justify-center border ${isArtist ? "border-gold" : "border-border"}`}>
                    <TypeIcon className={`w-2.5 h-2.5 ${isArtist ? "text-gold" : "text-text-muted"}`} />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.24em] text-text-dim">
                    {isArtist ? "Artist Verification" : "Business Verification"}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-5 py-6 flex-1 space-y-5">

                  {/* Profile row */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={verification.client.profile}
                        alt="Profile"
                        className="h-12 w-12 object-cover"
                        style={{ borderRadius: 0 }}
                      />
                      {/* Gold corner accent on avatar */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-lg font-light text-text tracking-wide truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {verification.client.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-px w-3 bg-gold opacity-60" />
                        <Badge>
                          {verification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Request type</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">{verification.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Status</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Pending</span>
                    </div>
                  </div>
                </div>

                {/* Card footer: action */}
                <div className="border-t border-border px-5 py-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Review details</span>
                  {verification.type === "artist"
                    ? <ArtistVerificationModal artistVerification={verification} setArtistVerification={setArtistVerifications} />
                    : <BussinessVerificationModal artistVerification={verification} setArtistVerification={setArtistVerifications} />
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom rule */}
        {artistVerifications.length > 0 && (
          <div className="mt-8 flex items-center gap-4 border-t border-border pt-5">
            <div className="h-px w-4 bg-gold opacity-40" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">
              Showing {artistVerifications.length} pending verification{artistVerifications.length !== 1 ? "s" : ""} · Ink Of Baphomet Admin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}