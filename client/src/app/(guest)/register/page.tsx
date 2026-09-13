"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import {
  LoaderCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { accountInterfaceInput } from "@/app/types/accounts.type";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { useZodForm } from "@/lib/validation/useZodForm";
import {
  registerSchema,
  type RegisterValues,
} from "@/lib/validation/schemas/auth";
import { Controller } from "react-hook-form";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import useUserStore from "@/app/store/useUserStore";
import { BackButton } from "@/components/ui/back-button";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useZodForm(registerSchema, {
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

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
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const row4Ref = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Capture refs immediately
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
    const row1El = row1Ref.current;
    const row2El = row2Ref.current;
    const row3El = row3Ref.current;
    const row4El = row4Ref.current;
    const termsEl = termsRef.current;
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
      gsap.set(
        [
          logoEl,
          headEl,
          subEl,
          row1El,
          row2El,
          row3El,
          row4El,
          termsEl,
          btnEl,
          footEl,
        ],
        { opacity: 0, y: 20 },
      );

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(rootEl, { opacity: 1, duration: 0.3 })
        .to(
          curtainEl,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.9,
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
        .to(dividerEl, { scaleX: 1, duration: 0.55, ease: "power3.inOut" }, 0.7)
        .to(logoEl, { opacity: 1, y: 0, duration: 0.5 }, 0.72)
        .to(
          headEl,
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
          0.82,
        )
        .to(subEl, { opacity: 1, y: 0, duration: 0.45 }, 0.92)
        .to(row1El, { opacity: 1, y: 0, duration: 0.42 }, 1.0)
        .to(row2El, { opacity: 1, y: 0, duration: 0.42 }, 1.09)
        .to(row3El, { opacity: 1, y: 0, duration: 0.42 }, 1.17)
        .to(row4El, { opacity: 1, y: 0, duration: 0.42 }, 1.25)
        .to(termsEl, { opacity: 1, y: 0, duration: 0.38 }, 1.33)
        .to(btnEl, { opacity: 1, y: 0, duration: 0.38 }, 1.41)
        .to(footEl, { opacity: 1, y: 0, duration: 0.35 }, 1.49)
        .to(quoteWrapEl, { opacity: 1, duration: 0.1 }, 0.9)
        .to(
          quoteLineEl,
          { scaleX: 1, duration: 0.5, ease: "power3.inOut" },
          0.9,
        )
        .to(quoteTxtEl, { opacity: 1, y: 0, duration: 0.55 }, 1.0)
        .to(quoteSubEl, { opacity: 1, y: 0, duration: 0.45 }, 1.1);

      const onMouseMove = (e: MouseEvent) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 10;
        const dy = (e.clientY / window.innerHeight - 0.5) * 10;
        gsap.to(imgEl, { x: -dx, y: -dy, duration: 1.4, ease: "power2.out" });
      };
      window.addEventListener("mousemove", onMouseMove);
      return () => window.removeEventListener("mousemove", onMouseMove);
    });

    return () => ctx.revert();
  }, []);

  const onFocus = (el: HTMLElement | null) => {
    if (el) gsap.to(el, { y: -3, duration: 0.22, ease: "power2.out" });
  };
  const onBlur = (el: HTMLElement | null) => {
    if (el) gsap.to(el, { y: 0, duration: 0.22, ease: "power2.out" });
  };

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: accountInterfaceInput) =>
      axiosInstance.post("/auth/register", data),
    onSuccess: (response) => {
      router.push("/otp/" + response.data.userId);
    },
    onError: (err: { request: { response: string } }) => {
      errorAlert(err.request.response);
      setIsLoading(false);
      gsap.fromTo(
        rightRef.current,
        { x: -10 },
        { x: 0, duration: 0.55, ease: "elastic.out(1, 0.35)" },
      );
    },
  });

  const handleRegister = (values: RegisterValues) => {
    setIsLoading(true);
    mutation.mutate({
      name: values.name,
      type: "client",
      email: values.email,
      password: values.password,
      contact: values.contact,
      profile: "/default_profile.jpg",
      location: null,
      subscriptionExpiration: null,
      isBan: false,
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
    });
  };

  // Shared input classes
  const inputBase =
    "w-full pl-9 pr-3.5 py-[0.72rem] bg-primary border border-border text-text text-sm  outline-none transition-all duration-200 placeholder:text-text-dim placeholder:text-[0.8rem] focus:border-gold focus:shadow-[0_0_0_1px_rgba(201,168,76,0.15)]";
  const labelBase =
    "block text-[0.61rem] font-light tracking-[0.2em] uppercase text-text-muted mb-1.5";
  const iconBase =
    "absolute left-3 w-[13px] h-[13px] text-border pointer-events-none transition-colors duration-200";

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex items-center justify-center bg-primary px-4 pt-20 pb-12 relative overflow-hidden"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold z-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[960px] grid grid-cols-1 md:grid-cols-[5fr_7fr] overflow-hidden bg-secondary border border-border">
        {/* ── LEFT PANEL ── */}
        <div
          ref={leftRef}
          className="relative hidden md:block overflow-hidden bg-primary min-h-[580px]"
        >
          <div
            ref={curtainRef}
            className="absolute inset-0 bg-primary z-10 pointer-events-none"
          />
          <img
            ref={imgRef}
            src="/web/img3.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "grayscale(100%) contrast(1.15) brightness(0.75)",
              willChange: "transform",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(168deg, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.82) 100%)",
            }}
          />
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gold opacity-50 z-[4]" />
          <div
            className="absolute top-6 right-6 w-14 h-14 z-[4]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(201,168,76,0.4) 1.2px, transparent 1.2px)",
              backgroundSize: "8px 8px",
            }}
          />
          <div className="absolute top-[1.4rem] left-[1.4rem] w-[22px] h-[22px] border-t border-l border-gold/60 z-[4]" />
          <div className="absolute bottom-[1.4rem] right-[1.4rem] w-[22px] h-[22px] border-b border-r border-gold/60 z-[4]" />

          <div
            ref={quoteWrapRef}
            className="absolute bottom-0 left-0 right-0 p-8 z-[4]"
          >
            <div ref={quoteLineRef} className="w-full h-px bg-gold/25 mb-5" />
            <p
              ref={quoteTxtRef}
              className="text-text font-light leading-[1.25] tracking-[-0.015em] mb-3"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.75rem",
              }}
            >
              Begin your <em className="not-italic text-gold">story here.</em>
            </p>
            <p
              ref={quoteSubRef}
              className="text-[0.62rem] tracking-[0.28em] uppercase text-gold/50 font-light"
            >
              Join the Ink Of Baphomet community
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          ref={rightRef}
          className="flex flex-col justify-center px-7 py-8 bg-secondary border-l border-border"
        >
          <div className="mb-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1
                  ref={headRef}
                  className="text-text font-light tracking-[-0.02em] leading-[1.1] mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2rem",
                  }}
                >
                  Create account
                </h1>
              </div>
              <BackButton />
            </div>

            {/* Logo (hidden) */}
            <div ref={logoRef} className="hidden items-center gap-2.5">
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
          </div>

          <div ref={dividerRef} className="w-full h-px bg-border my-5" />

          <form onSubmit={handleSubmit(handleRegister)} noValidate>
            {/* Row 1 — Name + Contact */}
            <div ref={row1Ref} className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className={labelBase}>Full name</label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className={iconBase}
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
                    className={`${inputBase} ${errors.name ? "!border-danger" : ""}`}
                    type="text"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    placeholder="Your name"
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                </div>
                <FieldError>{errors.name?.message}</FieldError>
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelBase}>Contact</label>

                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className={iconBase}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      d="M3 2h3l1.5 4L6 7.5a9 9 0 004.5 4.5L12 10.5l4 1.5v3a1 1 0 01-1 1A15 15 0 012 3a1 1 0 011-1z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <Controller
                    control={control}
                    name="contact"
                    render={({ field }) => (
                      <input
                        className={`${inputBase} ${
                          errors.contact
                            ? "!border-danger"
                            : field.value.length === 11
                              ? "!border-success"
                              : "border-border"
                        }`}
                        type="text"
                        inputMode="numeric"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, "").slice(0, 11),
                          )
                        }
                        aria-invalid={!!errors.contact}
                        placeholder="09XXXXXXXXX"
                        style={{
                          borderRadius: 0,
                          fontFamily: "'Raleway', sans-serif",
                        }}
                      />
                    )}
                  />
                </div>
                <FieldError>{errors.contact?.message}</FieldError>
              </div>
            </div>

            {/* Row 2 — Email + ID */}
            <div ref={row2Ref} className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <label className={labelBase}>Email address</label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className={iconBase}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="1" y="3" width="14" height="10" rx="2" />
                    <path d="M1 5l7 5 7-5" strokeLinecap="round" />
                  </svg>
                  <input
                    className={`${inputBase} ${errors.email ? "!border-danger" : ""}`}
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    placeholder="you@example.com"
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </div>
            </div>

            {/* Row 3 + 4 — Passwords */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Password */}
              <div ref={row3Ref} className="flex flex-col gap-1">
                <label className={labelBase}>Password</label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className={iconBase}
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
                    className={`${inputBase} pr-9 ${errors.password ? "!border-danger" : ""}`}
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    placeholder="Min. 8 characters"
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 text-text-dim hover:text-gold transition-colors duration-200 p-1"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
                {password && (
                  <>
                    <div className="flex gap-[3px] mt-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-[2px] flex-1 transition-colors duration-300 ${i < strength ? "bg-gold" : "bg-border"}`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-[0.62rem] tracking-[0.16em] uppercase font-light mt-0.5 ${strength === 4 ? "text-gold" : "text-text-muted"}`}
                    >
                      {strengthLabels[strength - 1] ?? ""}
                    </p>
                  </>
                )}
              </div>

              {/* Confirm password */}
              <div ref={row4Ref} className="flex flex-col gap-1">
                <label className={labelBase}>Confirm password</label>
                <div
                  className="relative flex items-center"
                  onFocus={(e) => onFocus(e.currentTarget)}
                  onBlur={(e) => onBlur(e.currentTarget)}
                  style={{ willChange: "transform" }}
                >
                  <svg
                    className={iconBase}
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
                    className={`${inputBase} pr-9 ${errors.confirmPassword ? "!border-danger" : confirmPassword ? (confirmPassword === password ? "!border-success" : "border-border") : ""}`}
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    aria-invalid={!!errors.confirmPassword}
                    placeholder="Repeat password"
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 text-text-dim hover:text-gold transition-colors duration-200 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                  </button>
                </div>
                {confirmPassword &&
                  confirmPassword === password &&
                  !errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-[0.65rem] tracking-[0.1em] uppercase font-light text-success-light mt-0.5">
                      <CheckCircle2 size={11} /> Passwords match
                    </p>
                  )}
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </div>
            </div>

            {/* Terms */}
            <div ref={termsRef} className="mb-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="rp-terms"
                  {...register("terms")}
                  aria-invalid={!!errors.terms}
                  className="mt-[2px] w-[13px] h-[13px] flex-shrink-0 cursor-pointer accent-gold"
                />
                <label
                  htmlFor="rp-terms"
                  className="text-[0.72rem] text-text-muted font-light leading-relaxed tracking-[0.03em] cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-gold border-b border-gold/30 pb-px hover:border-gold hover:text-gold-light transition-all duration-200"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-gold border-b border-gold/30 pb-px hover:border-gold hover:text-gold-light transition-all duration-200"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              <FieldError>{errors.terms?.message}</FieldError>
            </div>

            {/* Submit */}
            <div ref={btnRef} style={{ willChange: "transform" }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-[0.72rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                style={{ borderRadius: 0, fontFamily: "'Raleway', sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div
            ref={footRef}
            className="mt-5 pt-5 border-t border-border text-center"
          >
            <p className="text-[0.72rem] text-text-muted font-light tracking-[0.04em]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-gold border-b border-gold/30 pb-px hover:border-gold hover:text-gold-light transition-all duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
