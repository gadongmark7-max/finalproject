"use client";

import Link from "next/link";
import { KeyRound, DatabaseBackup, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const SETTINGS_ITEMS = [
  {
    title: "Change Password",
    description: "Update the password used to sign in to your account.",
    url: "/pages/artist/settings/change-password",
    icon: KeyRound,
  },
  {
    title: "Backup & Restore",
    description: "Create a full data backup or restore from a backup file.",
    url: "/pages/artist/settings/backup-restore",
    icon: DatabaseBackup,
  },
];

export default function Page() {
  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-3xl mx-auto">
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
                Account
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Settings
            </h1>
          </div>

          <BackButton />
        </div>

        <div className="space-y-3">
          {SETTINGS_ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="group flex items-center gap-4 bg-surface border border-border hover:border-border-gold transition-all duration-300 p-5"
            >
              <div className="bg-surface-alt border border-border group-hover:border-border-gold p-3 flex-shrink-0">
                <item.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-light text-text"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.title}
                </h2>
                <p className="text-sm text-text-muted mt-0.5">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-gold transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
