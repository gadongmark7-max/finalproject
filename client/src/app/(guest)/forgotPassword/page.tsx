"use client";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FieldError } from "@/components/ui/field-error";
import { useZodForm } from "@/lib/validation/useZodForm";
import {
  forgotEmailSchema,
  forgotOtpSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas/auth";
import {
  Mail,
  KeyRound,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const emailForm = useZodForm(forgotEmailSchema, {
    defaultValues: { email: "" },
  });
  const otpForm = useZodForm(forgotOtpSchema, { defaultValues: { code: "" } });
  const resetForm = useZodForm(resetPasswordSchema, {
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtpMutation = useMutation({
    mutationFn: (email: string) =>
      axiosInstance.post("/auth/forgotPassword/otp", { email }),
    onSuccess: () => {
      successAlert("Reset code sent to your email");
      setStep(2);
      setTimer(30);
    },
    onError: (err: { request: { response: string } }) => {
      errorAlert(err.request.response || "error");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (otpInput: string) =>
      axiosInstance.post("/auth/forgotPassword/verify", { email, otpInput }),
    onSuccess: () => {
      setIsCorrect(true);
      setTimeout(() => setStep(3), 1200);
    },
    onError: () => {
      setIsCorrect(false);
      errorAlert("invalid code");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => axiosInstance.post("/auth/forgotPassword/otp", { email }),
    onSuccess: () => {
      successAlert("New code sent");
      setTimer(30);
    },
    onError: (err: { request: { response: string } }) =>
      errorAlert(err.request.response || "error"),
  });

  const updateMutation = useMutation({
    mutationFn: (newPassword: string) =>
      axiosInstance.put("/auth/forgotPassword/update", { email, newPassword }),
    onSuccess: () => {
      successAlert("Password updated successfully");
      router.push("/login");
    },
    onError: (err: { request: { response: string } }) => {
      errorAlert(err.request.response || "error");
    },
  });

  const handleSendOtp = emailForm.handleSubmit((values) => {
    setEmail(values.email);
    sendOtpMutation.mutate(values.email);
  });

  const handleVerify = otpForm.handleSubmit((values) => {
    verifyMutation.mutate(values.code);
  });

  const handleResend = () => {
    if (timer > 0) return;
    resendMutation.mutate();
  };

  const handleUpdate = resetForm.handleSubmit((values) => {
    updateMutation.mutate(values.password);
  });

  const inputBase =
    "w-full pl-10 pr-3.5 py-3 bg-primary border border-border text-text text-sm font-light outline-none transition-all duration-200 placeholder:text-text-dim placeholder:text-[0.82rem] focus:border-gold focus:shadow-[0_0_0_1px_rgba(201,168,76,0.15)]";
  const labelBase =
    "block text-[0.62rem] font-light tracking-[0.2em] uppercase text-text-muted mb-2";
  const iconBase =
    "absolute left-3.5 w-3.5 h-3.5 text-border pointer-events-none transition-colors duration-200";

  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Code" },
    { n: 3, label: "Password" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-6 py-14 relative overflow-hidden">
      <div className="flex items-center gap-2 absolute top-2 left-2">
        <Link
          href={"/"}
          className="flex h-24 w-42 items-center justify-center rounded-lg hover:scale-95"
        >
          <img
            src="/web/logo.jpg"
            alt="Tattoo design 1"
            className="h-full w-full rounded-lg"
          />
        </Link>
      </div>

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-surface border border-border group overflow-hidden">
        {/* Gold corner brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />

        {/* Gold bottom reveal line */}
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

        <div className="p-10 flex flex-col gap-8">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-3">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className={`w-8 h-px ${step >= s.n ? "bg-gold" : "bg-border"}`}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 flex items-center justify-center text-[10px] tracking-widest transition-all duration-300 ${
                      step >= s.n
                        ? "bg-gold text-primary"
                        : "bg-surface-alt border border-border text-text-muted"
                    }`}
                  >
                    {s.n}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-[0.18em] ${step >= s.n ? "text-gold" : "text-text-muted"}`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Icon + Heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-surface-alt border border-border w-14 h-14 flex items-center justify-center">
              {step === 1 && <Mail className="text-gold" size={22} />}
              {step === 2 && <KeyRound className="text-gold" size={22} />}
              {step === 3 && <Lock className="text-gold" size={22} />}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Recover Access
                </span>
                <div className="h-px w-8 bg-gold opacity-60" />
              </div>

              <h1
                className="text-3xl font-light text-text tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {step === 1 && "Find your account"}
                {step === 2 && "Enter Your Code"}
                {step === 3 && "Set a new password"}
              </h1>

              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                {step === 1 &&
                  "Enter the email linked to your account and we will send you a reset code."}
                {step === 2 && `A one-time passcode has been sent to ${email}.`}
                {step === 3 &&
                  "Your code is verified. Choose a new password for your account."}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* ── STEP 1 : EMAIL ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
              <div>
                <label className={labelBase}>Email address</label>
                <div className="relative flex items-center">
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
                    type="email"
                    {...emailForm.register("email")}
                    placeholder="you@example.com"
                    aria-invalid={!!emailForm.formState.errors.email}
                    className={`${inputBase} ${emailForm.formState.errors.email ? "!border-danger" : ""}`}
                    style={{
                      borderRadius: 0,
                      fontFamily: "'Raleway', sans-serif",
                    }}
                  />
                </div>
                <FieldError>
                  {emailForm.formState.errors.email?.message}
                </FieldError>
              </div>

              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="w-full bg-gold text-primary text-[11px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendOtpMutation.isPending ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Send Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2 : OTP ── */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className={labelBase}>One-Time Passcode</label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...otpForm.register("code", {
                    onChange: () => setIsCorrect(null),
                  })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                  placeholder="— — — — — —"
                  maxLength={6}
                  aria-invalid={!!otpForm.formState.errors.code}
                  className={`bg-surface border rounded-none text-text text-center text-xl tracking-[0.4em] px-4 py-3 placeholder:text-text-dim focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-300 w-full ${otpForm.formState.errors.code ? "border-danger" : "border-border"}`}
                />
                <FieldError>
                  {otpForm.formState.errors.code?.message}
                </FieldError>
              </div>

              {/* Status: Error */}
              {isCorrect === false && (
                <div className="flex items-start gap-3 bg-danger-muted border border-danger-border px-4 py-3">
                  <ShieldX
                    className="text-danger-light mt-0.5 shrink-0"
                    size={16}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-danger-light">
                      Invalid Code
                    </span>
                    <p className="text-danger-light text-sm leading-relaxed opacity-80">
                      The code you entered is incorrect. Please try again or
                      request a new code.
                    </p>
                  </div>
                </div>
              )}

              {/* Status: Success */}
              {isCorrect === true && (
                <div className="flex items-start gap-3 bg-success-muted border border-success-border px-4 py-3">
                  <ShieldCheck
                    className="text-success-light mt-0.5 shrink-0"
                    size={16}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-success-light">
                      Identity Verified
                    </span>
                    <p className="text-success-light text-sm leading-relaxed opacity-80">
                      Your code has been accepted. Setting up your new password…
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={
                  verifyMutation.isPending ||
                  !otpForm.formState.isValid ||
                  isCorrect === true
                }
                className="w-full bg-gold text-primary text-[11px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {verifyMutation.isPending ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {isCorrect !== true && (
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
              )}
            </div>
          )}

          {/* ── STEP 3 : NEW PASSWORD ── */}
          {step === 3 && (
            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelBase}>New password</label>
                  <div className="relative flex items-center">
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
                      type={showPassword ? "text" : "password"}
                      {...resetForm.register("password")}
                      placeholder="Min. 8 characters"
                      aria-invalid={!!resetForm.formState.errors.password}
                      className={`${inputBase} pr-10 ${resetForm.formState.errors.password ? "!border-danger" : ""}`}
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
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <FieldError>
                    {resetForm.formState.errors.password?.message}
                  </FieldError>
                </div>

                <div>
                  <label className={labelBase}>Confirm password</label>
                  <div className="relative flex items-center">
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
                      type={showConfirmPassword ? "text" : "password"}
                      {...resetForm.register("confirmPassword")}
                      placeholder="Repeat password"
                      aria-invalid={
                        !!resetForm.formState.errors.confirmPassword
                      }
                      className={`${inputBase} pr-10 ${resetForm.formState.errors.confirmPassword ? "!border-danger" : ""}`}
                      style={{
                        borderRadius: 0,
                        fontFamily: "'Raleway', sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                      className="absolute right-3 text-text-dim hover:text-gold transition-colors duration-200 p-1"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                  {resetForm.watch("confirmPassword") &&
                    resetForm.watch("confirmPassword") ===
                      resetForm.watch("password") &&
                    !resetForm.formState.errors.confirmPassword && (
                      <p className="flex items-center gap-1 text-[0.65rem] tracking-[0.1em] uppercase font-light text-success-light mt-1.5">
                        <CheckCircle2 size={11} /> Passwords match
                      </p>
                    )}
                  <FieldError>
                    {resetForm.formState.errors.confirmPassword?.message}
                  </FieldError>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-gold text-primary text-[11px] uppercase tracking-[0.24em] px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-border">
            {step > 1 && !isCorrect ? (
              <button
                onClick={() =>
                  setStep((prev) =>
                    prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev,
                  )
                }
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-gold transition-colors duration-200"
              >
                <ArrowLeft size={12} /> Back
              </button>
            ) : (
              <span />
            )}

            <Link
              href="/login"
              className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-gold transition-colors duration-200"
            >
              Return to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
