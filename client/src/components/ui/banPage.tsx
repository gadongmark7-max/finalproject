"use client";
import Link from "next/link";
import { ShieldOff, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BanPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary flex-col relative overflow-hidden">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Danger ambient glow */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] blur-[100px] bg-danger" />

      {/* Main Card */}
      <div className="relative bg-secondary border border-border max-w-lg w-full mx-6 p-12 flex flex-col items-center text-center">

        {/* Gold corner brackets */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold opacity-40" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold opacity-40" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold opacity-40" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold opacity-40" />

        {/* Icon */}
        <div className="bg-danger-muted border border-danger-border w-16 h-16 flex items-center justify-center mb-8">
          <ShieldOff size={28} className="text-danger-light" />
        </div>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold opacity-60" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Account Restricted</span>
          <div className="h-px w-8 bg-gold opacity-60" />
        </div>

        {/* Heading */}
        <h1
          className="text-4xl font-light text-text tracking-[-0.02em] leading-tight mb-5"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Your Account Has Been Suspended
        </h1>

        {/* Divider */}
        <div className="h-px w-12 bg-gold opacity-30 mb-6" />

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed mb-3">
          An administrator has reviewed your account and determined that it
          violates our platform's community standards and terms of service.
        </p>
        <p className="text-sm text-text-muted leading-relaxed mb-10">
          If you believe this action was taken in error or would like to appeal
          this decision, please reach out to our support team with your account
          details and a brief explanation.
        </p>

        {/* Notice box */}
        <div className="w-full bg-surface border border-border p-4 mb-10 flex items-start gap-3 text-left">
          <Mail size={14} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">Appeal This Decision</p>
            <p className="text-xs text-text-dim leading-relaxed">
              Contact us at{" "}
              <span className="text-gold">support@Ink Of Baphomet.com</span>
              {" "}and reference your registered email address. Appeals are reviewed within 3–5 business days.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft size={13} />
              Return to Home
            </Button>
          </Link>
          <Link href="mailto:support@Ink Of Baphomet.com" className="flex-1">
            <Button className="w-full">
              Contact Support
            </Button>
          </Link>
        </div>

      </div>

      {/* Bottom label */}
      <p className="mt-8 text-[10px] uppercase tracking-widest text-text-dim">
        Ink Of Baphomet — Platform Administration
      </p>

    </div>
  );
}