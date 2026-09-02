"use client"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LockKeyhole, ArrowRight } from "lucide-react";

export default function NotVerified() {
  const router = useRouter();

  return (
    <div className="w-full h-dvh bg-primary flex items-center justify-center relative overflow-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes strikeGrow {
          to { width: 100%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.07; }
          50%       { opacity: 0.13; }
        }

        .anim-scale { animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .anim-up-1  { animation: fadeUp 0.55s ease both 0.1s; }
        .anim-up-2  { animation: fadeUp 0.55s ease both 0.22s; }
        .anim-up-3  { animation: fadeUp 0.55s ease both 0.34s; }
        .anim-up-4  { animation: fadeUp 0.55s ease both 0.46s; }
        .anim-up-5  { animation: fadeUp 0.55s ease both 0.58s; }

        .strike-line {
          position: absolute;
          left: 0;
          bottom: 8px;
          height: 1px;
          width: 0;
          background: #C9A84C;
          animation: strikeGrow 0.8s ease 0.8s forwards;
        }

        .glow-animate {
          animation: glowPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="glow-animate pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full blur-[120px] bg-gold" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-gold opacity-30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-gold opacity-30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-gold opacity-30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-gold opacity-30" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">

        {/* Lock icon */}
        <div className="anim-scale mb-8">
          <div className="relative w-20 h-20 border border-border bg-surface flex items-center justify-center">
            <div className="absolute inset-0 border border-gold opacity-20" style={{ margin: "4px" }} />
            <LockKeyhole className="w-8 h-8 text-gold" />
          </div>
        </div>

        {/* Eyebrow */}
        <div className="anim-up-1 flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Account Not Verified</span>
          <div className="h-px w-8 bg-gold" />
        </div>

        {/* Headline */}
        <div className="anim-up-2 mb-6">
          <h1
            className="font-light text-text tracking-[-0.02em] leading-[0.95] relative"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(4rem, 10vw, 7rem)" }}
          >
            Access
            <br />
            <span className="relative inline-block">
              Restricted
              <span className="strike-line" />
            </span>
          </h1>
        </div>

        {/* Body */}
        <p className="anim-up-3 text-text-muted text-sm leading-relaxed max-w-xs mb-8">
         This feature is unavailable because your account is not yet verified. Submit all required business documents to unlock full access and continue using this feature.
        </p>

        {/* Divider */}
        <div className="anim-up-4 flex items-center gap-4 mb-8 w-full max-w-xs">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] uppercase tracking-[0.28em] text-text-dim">Complete Requirements to unlock</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* CTA */}
        <div className="anim-up-5 w-full max-w-xs space-y-4">
          <div className="relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold opacity-40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold opacity-40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />
            <div className="p-3">
              <Button
                onClick={() => router.push("/pages/bussiness/documents")}
                className="w-full"
              >
                Submit Documents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
            Fast review · Secure process · Business compliance required
          </p>
        </div>

      </div>
    </div>
  );
}