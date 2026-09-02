"use client"
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Building2, Users, Users2, Shield, FileText,
  DollarSign, Calendar, MessageCircle, Package, History, Bell,
  LucideCircleDollarSign, CheckCircle2, ArrowRight, Sparkles,
} from "lucide-react";
import useUserStore from "@/app/store/useUserStore";

const DollarSignIcon = DollarSign;

const NAV_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, desc: "Real-time overview of your business." },
  { title: "Business Profile", icon: Building2, desc: "Customize your profile and branding." },
  { title: "Artists", icon: Users, desc: "Manage artists under your business." },
  { title: "Employee", icon: Users2, desc: "Handle employee records and access." },
  { title: "Role", icon: Shield, desc: "Define permissions and assign roles." },
  { title: "Post", icon: FileText, desc: "Publish posts to showcase your services." },
  { title: "Payments", icon: DollarSign, desc: "Track client payments and billing." },
  { title: "Bookings", icon: Calendar, desc: "Manage all booking requests." },
  { title: "Chat", icon: MessageCircle, desc: "Built-in messaging with clients and artists." },
  { title: "Finance", icon: DollarSignIcon, desc: "Monitor revenue and expenses." },
  { title: "Payroll", icon: LucideCircleDollarSign, desc: "Process team payroll on time." },
  { title: "Inventory", icon: Package, desc: "Track supplies and stock levels." },
  { title: "Transactions", icon: History, desc: "Full history of all transactions." },
  { title: "Notifications", icon: Bell, desc: "Alerts on bookings, payments, activity." },
];

export default function FreeTrial() {
  const { user, setUser } = useUserStore();

  const mutation = useMutation({
    mutationFn: () => axiosInstance.put("/account/freeTrial/" + user?._id, { days: 30 }),
    onSuccess: (response) => {
      setUser(response.data);
      successAlert("Your 30-day free trial has started!");
    },
    onError: () => errorAlert("Something went wrong. Please try again."),
  });

  const handleStart = () => {
    confirmAlert("you want to start trial now?", "Start", () => {
      mutation.mutate();
    });
  };

  return (
    <div className="w-full h-dvh bg-primary flex flex-col lg:flex-row overflow-hidden">

      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* LEFT — Hero / CTA */}
      <div className="relative flex flex-col justify-between lg:w-[42%] bg-secondary border-r border-border p-10 lg:p-14 overflow-hidden flex-shrink-0">

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gold corner brackets */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold opacity-40" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold opacity-40" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold opacity-40" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold opacity-40" />

        {/* Top badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 border border-border-gold text-gold text-[10px] font-light uppercase tracking-[0.28em] px-3 py-1.5">
            <Sparkles className="w-3 h-3" />
            New Business Offer
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          {/* Big days counter */}
          <div className="space-y-2">
            <div
              className="text-[96px] font-light text-gold leading-none tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              30
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold opacity-60" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">Days Free Trial</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1
              className="text-3xl font-light text-text leading-tight tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Try everything.<br />
              <span className="text-text-muted">No commitment.</span>
            </h1>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Get full access to all features for 30 days at no cost. After your trial ends, a subscription is required to continue — no charges during the trial period.
            </p>
          </div>

          <Button
            onClick={handleStart}
            disabled={mutation.isPending}
            variant="outline"
          >
            {mutation.isPending ? "Starting..." : "Start Free Trial"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom note */}
        <div className="relative z-10 flex items-center gap-2 text-text-dim text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          No credit card required. Cancel anytime.
        </div>
      </div>

      {/* RIGHT — Feature list */}
      <div className="flex-1 flex flex-col p-8 lg:p-10 overflow-hidden bg-primary">

        {/* Section label */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold opacity-50" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Everything included in your trial</span>
          </div>
        </div>

        {/* Feature grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 content-start overflow-hidden">
          {NAV_ITEMS.map(({ title, icon: Icon, desc }) => (
            <div
              key={title}
              className="group relative flex items-center gap-3 border border-border bg-surface px-3 py-3 hover:border-border-gold transition-all duration-300 overflow-hidden"
            >
              {/* Bottom gold line reveal */}
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />

              <div className="bg-surface-alt border border-border group-hover:border-border-gold w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                <Icon className="w-3.5 h-3.5 text-gold" />
              </div>
              <div className="min-w-0">
                <div
                  className="text-text text-xs font-light truncate tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {title}
                </div>
                <div className="text-text-dim text-[11px] leading-tight mt-0.5 line-clamp-1">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom subscribe note */}
        <div className="mt-5 bg-surface border border-border px-4 py-3 flex items-center gap-3">
          <div className="w-1 h-1 bg-gold flex-shrink-0" />
          <p className="text-text-muted text-xs leading-relaxed">
            After 30 days, access pauses until you subscribe to a plan. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}