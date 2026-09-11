"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useUserStore from "@/app/store/useUserStore";
import axiosInstance from "@/app/utils/axios";
import { errorAlert } from "@/app/utils/alert";
import { LoaderCircle, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { useZodForm } from "@/lib/validation/useZodForm";
import { loginSchema, type LoginValues } from "@/lib/validation/schemas/auth";
import { gsap } from "gsap";
import { BackButton } from "@/components/ui/back-button";

const ATTEMPTS_PER_BATCH = 3;
const BASE_LOCKOUT_SECONDS = 20;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useZodForm(loginSchema, { defaultValues: { email: "", password: "" } });

  // ── Lockout state ──
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [lockDuration, setLockDuration] = useState(BASE_LOCKOUT_SECONDS);
  const [lockoutBatch, setLockoutBatch] = useState(() => {
    if (typeof window !== "undefined") {
      const v = Number(localStorage.getItem("loginLockoutBatch"));
      return Number.isFinite(v) && v > 0 ? v : 0;
    }
    return 0;
  });

  const isLocked = lockedUntil !== null && secondsLeft > 0;

  const { setUser } = useUserStore();
  const router = useRouter();

  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const quoteWrapRef = useRef<HTMLDivElement>(null);
  const quoteLineRef = useRef<HTMLDivElement>(null);
  const quoteTxtRef = useRef<HTMLParagraphElement>(null);
  const quoteSubRef = useRef<HTMLParagraphElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const f1Ref = useRef<HTMLDivElement>(null);
  const f2Ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const lockRingRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    const curtainEl = curtainRef.current;
    const imgEl = imgRef.current;
    const quoteWrapEl = quoteWrapRef.current;
    const quoteLineEl = quoteLineRef.current;
    const quoteTxtEl = quoteTxtRef.current;
    const quoteSubEl = quoteSubRef.current;
    const rightEl = rightRef.current;
    const dividerEl = dividerRef.current;
    const logoEl = logoRef.current;
    const headEl = headRef.current;
    const subEl = subRef.current;
    const f1El = f1Ref.current;
    const f2El = f2Ref.current;
    const btnEl = btnRef.current;
    const footEl = footRef.current;

    const ctx = gsap.context(() => {
      gsap.set(rootEl, { opacity: 0 });
      gsap.set(curtainEl, { scaleX: 1, transformOrigin: "left center" });
      gsap.set(imgEl, { scale: 1.12, opacity: 0 });
      gsap.set(quoteWrapEl, { opacity: 0 });
      gsap.set(quoteLineEl, { scaleX: 0, transformOrigin: "left center" });
      gsap.set([quoteTxtEl, quoteSubEl], { opacity: 0, y: 18 });
      gsap.set(rightEl, { opacity: 0 });
      gsap.set(dividerEl, { scaleX: 0, transformOrigin: "left center" });
      gsap.set([logoEl, headEl, subEl, f1El, f2El, btnEl, footEl], {
        opacity: 0,
        y: 22,
      });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(rootEl, { opacity: 1, duration: 0.3 })
        .to(
          curtainEl,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.7,
            ease: "expo.inOut",
          },
          0.15,
        )
        .to(
          imgEl,
          { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
          0.25,
        )
        .to(rightEl, { opacity: 1, duration: 0.6 }, 0.55)
        .to(dividerEl, { scaleX: 1, duration: 2, ease: "power3.inOut" }, 0.7)
        .to(logoEl, { opacity: 1, y: 0, duration: 0.5 }, 0.72)
        .to(
          headEl,
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
          0.82,
        )
        .to(subEl, { opacity: 1, y: 0, duration: 0.45 }, 0.94)
        .to(f1El, { opacity: 1, y: 0, duration: 0.42 }, 1.04)
        .to(f2El, { opacity: 1, y: 0, duration: 0.42 }, 1.13)
        .to(btnEl, { opacity: 1, y: 0, duration: 0.4 }, 1.24)
        .to(footEl, { opacity: 1, y: 0, duration: 0.38 }, 1.34)
        .to(quoteWrapEl, { opacity: 1, duration: 0.1 }, 0.9)
        .to(
          quoteLineEl,
          { scaleX: 1, duration: 0.5, ease: "power3.inOut" },
          0.9,
        )
        .to(quoteTxtEl, { opacity: 1, y: 0, duration: 0.55 }, 1.0)
        .to(quoteSubEl, { opacity: 1, y: 0, duration: 0.45 }, 1.1);

      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth: W, innerHeight: H } = window;
        const dx = (e.clientX / W - 0.5) * 10;
        const dy = (e.clientY / H - 0.5) * 10;
        gsap.to(imgEl, { x: -dx, y: -dy, duration: 1.4, ease: "power2.out" });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    });

    return () => ctx.revert();
  }, []);

  // ── Lockout countdown ticker ──
  useEffect(() => {
    if (lockedUntil === null) return;

    const tick = () => {
      const msLeft = lockedUntil - Date.now();
      const secs = Math.max(0, Math.ceil(msLeft / 1000));
      setSecondsLeft(secs);
      if (secs <= 0) {
        setLockedUntil(null);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // ── Persist lockout multiplier across refreshes ──
  useEffect(() => {
    localStorage.setItem("loginLockoutBatch", String(lockoutBatch));
  }, [lockoutBatch]);

  // ── Animate lock panel in/out + progress ring ──
  useEffect(() => {
    if (isLocked && lockRef.current) {
      gsap.fromTo(
        lockRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isLocked]);

  useEffect(() => {
    if (!lockRingRef.current) return;
    const circumference = 2 * Math.PI * 26; // r=26
    const progress = lockedUntil ? secondsLeft / lockDuration : 0;
    const offset = circumference * (1 - progress);
    gsap.to(lockRingRef.current, {
      strokeDashoffset: offset,
      duration: 0.25,
      ease: "linear",
    });
  }, [secondsLeft, lockedUntil]);

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", data),
    onSuccess: (res) => {
      const { account, token } = res.data;
      localStorage.setItem("token", token);
      setUser(account);
      setFailedAttempts(0);
      setLockoutBatch(0);
      localStorage.setItem("loginLockoutBatch", "0");
      switch (account.type) {
        case "client":
          router.push(`/pages/client/profile`);
          break;
        case "artist":
          router.push(`/pages/artist/profile`);
          break;
        case "bussiness":
          router.push(`/pages/bussiness/dashboard`);
          break;
        case "employee":
          router.push(`/pages/bussiness/home`);
          break;
        case "admin":
          router.push(`/pages/admin/verifyArtist`);
          break;
      }
    },
    onError: (err: { request: { response: string } }) => {
      setValue("password", "");
      setValue("email", "");
      errorAlert(err.request.response);
      setIsLoading(false);
      gsap.fromTo(
        rightRef.current,
        { x: -10 },
        { x: 0, duration: 0.55, ease: "elastic.out(1, 0.35)" },
      );

      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= ATTEMPTS_PER_BATCH) {
          const batch = lockoutBatch + 1;
          const duration = batch * BASE_LOCKOUT_SECONDS;
          setLockoutBatch(batch);
          setLockDuration(duration);
          setLockedUntil(Date.now() + duration * 1000);
          setSecondsLeft(duration);
          return 0;
        }
        return next;
      });
    },
  });

  const handleLogin = (values: LoginValues) => {
    if (isLocked) return;
    gsap.to(btnRef.current, {
      scale: 0.97,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });
    mutation.mutate(values);
    setIsLoading(true);
  };

  const onFocus = (wrap: HTMLElement | null) => {
    if (!wrap) return;
    gsap.to(wrap, { y: -3, duration: 0.22, ease: "power2.out" });
  };
  const onBlur = (wrap: HTMLElement | null) => {
    if (!wrap) return;
    gsap.to(wrap, { y: 0, duration: 0.22, ease: "power2.out" });
  };

  const attemptsLeft = ATTEMPTS_PER_BATCH - failedAttempts;
  const circumference = 2 * Math.PI * 26;

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex items-center justify-center bg-primary px-6 pt-22 pb-14 relative overflow-hidden"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold z-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[880px] grid grid-cols-1 sm:grid-cols-2 overflow-hidden bg-secondary border border-border">
        {/* ── LEFT PANEL ── */}
        <div
          ref={leftRef}
          className="relative hidden sm:block overflow-hidden bg-primary min-h-[540px]"
        >
          {/* Curtain */}
          <div
            ref={curtainRef}
            className="absolute inset-0 bg-primary z-10 pointer-events-none"
          />

          {/* Background image */}
          <img
            ref={imgRef}
            src="/web/img2.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "grayscale(100%) contrast(1.15) brightness(0.75)",
              willChange: "transform",
            }}
          />

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(168deg, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.82) 100%)",
            }}
          />

          {/* Gold left bar */}
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gold opacity-50 z-[4]" />

          {/* Dot grid top-right */}
          <div
            className="absolute top-6 right-6 w-14 h-14 z-[4]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(201,168,76,0.4) 1.2px, transparent 1.2px)",
              backgroundSize: "8px 8px",
            }}
          />

          {/* Top-left bracket */}
          <div className="absolute top-[1.4rem] left-[1.4rem] w-[22px] h-[22px] border-t border-l border-gold/60 z-[4]" />

          {/* Bottom-right bracket */}
          <div className="absolute bottom-[1.4rem] right-[1.4rem] w-[22px] h-[22px] border-b border-r border-gold/60 z-[4]" />

          {/* Quote */}
          <div
            ref={quoteWrapRef}
            className="absolute bottom-0 left-0 right-0 p-8 z-[4]"
          >
            <div ref={quoteLineRef} className="w-full h-px bg-gold/25 mb-5" />
            <p
              ref={quoteTxtRef}
              className="text-text mb-3 font-light leading-[1.25] tracking-[-0.015em]"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.8rem",
              }}
            >
              Your skin,
              <br />
              <em className="not-italic text-gold">your story.</em>
            </p>
            <p
              ref={quoteSubRef}
              className="text-[0.62rem] tracking-[0.28em] uppercase text-gold/50 font-light"
            >
              Tattoo artistry &amp; discovery
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          ref={rightRef}
          className="flex flex-col justify-center px-8 py-10 bg-secondary border-l border-border relative"
        >
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div ref={logoRef} className="flex items-center gap-2.5">
              <img
                src="/web/logo.jpg"
                alt="Ink Of Baphomet"
                className="w-7 h-7 object-cover"
              />
              <span
                className="text-gold font-light tracking-[0.14em] uppercase"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1rem",
                }}
              >
                Ink Of Baphomet
              </span>
            </div>
            <BackButton />
          </div>
          <h1
            ref={headRef}
            className="text-text font-light tracking-[-0.02em] leading-[1.1] mb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "2.1rem",
            }}
          >
            Welcome back
          </h1>
          <p
            ref={subRef}
            className="text-[0.75rem] text-text-muted font-light tracking-[0.04em]"
          >
            Sign in to continue your journey
          </p>

          {/* Divider */}
          <div ref={dividerRef} className="w-full h-px bg-border my-6" />

          <fieldset disabled={isLocked} className="contents">
            <form onSubmit={handleSubmit(handleLogin)} noValidate>
              {/* Email */}
              <div ref={f1Ref} className="mb-5">
                <label className="block text-[0.62rem] font-light tracking-[0.2em] uppercase text-text-muted mb-2">
                  Email address
                </label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className="absolute left-3.5 w-3.5 h-3.5 text-border pointer-events-none transition-colors duration-200"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="8" cy="5.5" r="2.5" />
                    <path
                      d="M2 14c0-3 2.686-5 6-5s6 2 6 5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    className={`w-full pl-10 pr-3.5 py-3 bg-primary border text-text text-sm font-light outline-none transition-all duration-200 placeholder:text-text-dim placeholder:text-[0.82rem] focus:border-gold focus:shadow-[0_0_0_1px_rgba(201,168,76,0.15)] disabled:opacity-40 ${errors.email ? "border-danger" : "border-border"}`}
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </div>

              {/* Password */}
              <div ref={f2Ref} className="mb-2">
                <label className="block text-[0.62rem] font-light tracking-[0.2em] uppercase text-text-muted mb-2">
                  Password
                </label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className="absolute left-3.5 w-3.5 h-3.5 text-border pointer-events-none transition-colors duration-200"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="3" y="7.5" width="10" height="6.5" rx="2" />
                    <path
                      d="M5.5 7.5V5a2.5 2.5 0 015 0v2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className={`w-full pl-10 pr-10 py-3 bg-primary border text-text text-sm font-light outline-none transition-all duration-200 placeholder:text-text-dim focus:border-gold focus:shadow-[0_0_0_1px_rgba(201,168,76,0.15)] disabled:opacity-40 ${errors.password ? "border-danger" : "border-border"}`}
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={isLocked}
                    className="absolute right-3 text-text-dim hover:text-gold transition-colors duration-200 p-1 disabled:opacity-40"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </div>

              {/* Attempts-remaining hint (shows only after a failed try, before lockout) */}
              {!isLocked && failedAttempts > 0 && (
                <p className="text-[0.66rem] text-gold/70 font-light tracking-[0.03em] mt-1 mb-1">
                  {attemptsLeft === 1
                    ? "1 attempt remaining before your account is temporarily locked."
                    : `${attemptsLeft} attempts remaining before your account is temporarily locked.`}
                </p>
              )}

              {/* Submit / Lockout timer */}
              <div
                ref={btnRef}
                className="mt-5"
                style={{ willChange: "transform" }}
              >
                {isLocked ? (
                  <div
                    ref={lockRef}
                    className="w-full flex items-center gap-4 border border-gold/25 bg-primary px-4 py-3"
                  >
                    <div className="relative w-[60px] h-[60px] flex items-center justify-center shrink-0">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        className="-rotate-90"
                      >
                        <circle
                          cx="30"
                          cy="30"
                          r="26"
                          fill="none"
                          stroke="var(--border, #33302a)"
                          strokeWidth="2"
                          opacity="0.5"
                        />
                        <circle
                          ref={lockRingRef}
                          cx="30"
                          cy="30"
                          r="26"
                          fill="none"
                          stroke="currentColor"
                          className="text-gold"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={0}
                        />
                      </svg>
                      <span
                        className="absolute text-gold text-[0.85rem] font-light tabular-nums"
                        style={{ fontFamily: "'Raleway', sans-serif" }}
                      >
                        {secondsLeft}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[0.68rem] tracking-[0.16em] uppercase text-gold font-light">
                        <Lock size={11} />
                        Account locked
                      </span>
                      <span className="text-[0.7rem] text-text-muted font-light tracking-[0.02em]">
                        Too many attempts. Try again in {secondsLeft}s.
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 text-[0.72rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </fieldset>

          {/* Footer */}
          <div
            ref={footRef}
            className="mt-6 pt-5 border-t border-border text-center"
          >
            <p className="text-[0.72rem] text-text-muted font-light tracking-[0.04em]">
              Don&apos;t have an account?{" "}
              <Link
                href="/guest/register"
                className="text-gold border-b border-gold/30 pb-px hover:border-gold hover:text-gold-light transition-all duration-200"
              >
                Sign up here
              </Link>
            </p>
            <p className="text-[0.72rem] text-text-muted font-light tracking-[0.04em] mt-2">
              <Link
                href="/guest/forgotPassword"
                className="text-gold border-b border-gold/30 pb-px hover:border-gold hover:text-gold-light transition-all duration-200"
              >
                Forgot password
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
