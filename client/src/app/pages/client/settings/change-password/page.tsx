"use client";

import { BackButton } from "@/components/ui/back-button";
import { ChangePasswordForm } from "@/components/ui/change-password-form";

export default function Page() {
  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-lg mx-auto">
        {/* Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

        {/* Page Title */}
        <div className="flex items-center justify-between gap-2">
          <div className="border-b border-border pb-8 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Settings
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Change Password
            </h1>
          </div>

          <BackButton />
        </div>

        <div className="bg-surface border border-border p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
