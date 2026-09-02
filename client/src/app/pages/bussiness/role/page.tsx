"use client";

import { Label } from "@/components/ui/label";
import useUserStore from "@/app/store/useUserStore";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRolesModal } from "./components/addRoles";

export default function Page() {
  const { user } = useUserStore();
  const [bussinessInfo, setBussinessInfo] = useState<bussinessInfoInterface | null>(null);

  const { data: bussinessInfoData, refetch } = useQuery({
    queryKey: ["bussiness_profile"],
    queryFn: () => axiosInstance.get(`/account/bussinessInfo/${user?._id}`),
  });

  useEffect(() => {
    if (bussinessInfoData?.data) setBussinessInfo(bussinessInfoData.data);
  }, [bussinessInfoData]);

  if (!bussinessInfo) {
    return (
      <div className="w-full min-h-screen bg-primary flex items-center justify-center">
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted">Loading Roles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div className="w-full flex items-end justify-between border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Access Control</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Roles & Permissions
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Manage access levels for employees and staff
            </p>
          </div>

          <AddRolesModal refetch={refetch} />
        </div>

   

        {/* Roles Grid */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Role Registry</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {bussinessInfo.roles.map((item, index) => (
              <div
                key={index}
                className="group relative bg-surface p-6 space-y-5 hover:bg-surface-alt transition-all duration-500 overflow-hidden"
              >
                {/* Gold bottom reveal */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

                {/* Ghost index number */}
                <span
                  className="absolute top-4 right-5 text-6xl font-light text-text-dim select-none pointer-events-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Role Header */}
                <div className="flex items-center gap-3">
                  <div className="bg-surface-alt border border-border p-2.5 group-hover:border-border-gold transition-all duration-500">
                    <ShieldCheck size={16} className="text-gold" />
                  </div>
                  <div>
                    <h2
                      className="font-light text-text text-lg tracking-wide"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {item.role}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-text-dim">
                      {item.permissions.length} permission{item.permissions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Permissions */}
                <div className="flex flex-wrap gap-2">
                  {item.permissions.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 border border-border bg-surface-alt text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300"
                    >
                      <KeyRound size={10} className="text-gold opacity-70" />
                      {feature}
                    </span>
                  ))}

                  {item.permissions.length === 0 && (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim italic">
                      No permissions assigned
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Empty state */}
            {bussinessInfo.roles.length === 0 && (
              <div className="col-span-3 relative bg-secondary border border-dashed border-border py-20 flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />
                <ShieldCheck className="w-8 h-8 text-text-dim mb-4" />
                <p
                  className="text-xl font-light text-text-muted"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  No Roles Defined
                </p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-text-dim mt-2">
                  Add your first role to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">
            {bussinessInfo.roles.length} role{bussinessInfo.roles.length !== 1 ? "s" : ""} configured
          </p>
          <div className="h-px w-24 bg-border" />
        </div>

      </div>
    </div>
  );
}