"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldX, RotateCcw, ArrowRight, KeyRound } from "lucide-react";

export default function OtpPage() {
  const params = useParams();
  const paramsId = params.id as string;

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const submitMutation = useMutation({
    mutationFn: (input: string) =>
      axiosInstance.post("/auth/otp", { id: paramsId, input: input }),
    onSuccess: () => { setIsCorrect(true); },
    onError: () => { errorAlert("invalid code"); setIsCorrect(false); },
  });

  const resendMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post("/auth/resend", { id: paramsId }),
    onSuccess: () => { setTimer(30); },
    onError: (err: { request: { response: string } }) =>
      errorAlert("error"),
  });

  const handleResend = () => {
    if (timer > 0) return;
    resendMutation.mutate();
    setTimer(30);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    submitMutation.mutate(input);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary flex-col gap-6 px-4">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Brand label */}
      <p
        className="text-gold tracking-[0.28em] uppercase text-[11px] font-light"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
     
      </p>

      {/* Card */}
      <div className="relative w-full max-w-md bg-surface border border-border group overflow-hidden">

        {/* Gold corner brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />

        {/* Gold bottom reveal line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

        <div className="p-10 flex flex-col gap-8">

          {/* Icon + Eyebrow + Heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-surface-alt border border-border w-14 h-14 flex items-center justify-center">
              <KeyRound className="text-gold" size={22} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Verification
                </span>
                <div className="h-px w-8 bg-gold opacity-60" />
              </div>

              <h1
                className="text-3xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Enter Your Code
              </h1>

              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                A one-time passcode has been sent to your registered Email. 
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* OTP Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
              One-Time Passcode
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setIsCorrect(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="— — — — — —"
              maxLength={8}
              className="bg-surface border border-border rounded-none text-text text-center text-xl tracking-[0.4em] px-4 py-3 placeholder:text-text-dim focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-300 w-full"
            />
          </div>

          {/* Status: Error */}
          {isCorrect === false && (
            <div className="flex items-start gap-3 bg-danger-muted border border-danger-border px-4 py-3">
              <ShieldX className="text-danger-light mt-0.5 shrink-0" size={16} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-danger-light">
                  Invalid Code
                </span>
                <p className="text-danger-light text-sm leading-relaxed opacity-80">
                  The code you entered is incorrect or has expired. Please try again or request a new code below.
                </p>
              </div>
            </div>
          )}

          {/* Status: Success */}
          {isCorrect === true && (
            <div className="flex items-start gap-3 bg-success-muted border border-success-border px-4 py-3">
              <ShieldCheck className="text-success-light mt-0.5 shrink-0" size={16} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-success-light">
                  Identity Verified
                </span>
                <p className="text-success-light text-sm leading-relaxed opacity-80">
                  Your code has been accepted. You may now proceed to login.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">

            {isCorrect === true ? (
              <Link href="/guest/login" className="w-full">
                <button className="w-full bg-gold text-primary text-[11px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold-light transition-colors duration-300">
                  <span>Proceed to Login</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !input.trim()}
                className="w-full bg-gold text-primary text-[11px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending ? (
                  <span className="tracking-[0.24em]">Verifying…</span>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}

            {/* Resend with 30s timer */}

            {!isCorrect && (
                <button
                onClick={handleResend}
                disabled={timer > 0 || resendMutation.isPending}
                className="w-full border border-border text-text-muted text-[10px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:border-border-gold hover:text-text transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                <RotateCcw size={12} />
                {timer > 0 ? (
                    <span>Resend available in {timer}s</span>
                ) : (
                    <span>Resend Code</span>
                )}
                </button>

            ) }
           

          </div>

       
        </div>
      </div>

              <br />

    </div>
  );
}