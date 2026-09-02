"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Calendar, CalendarDays, Settings2, ArrowRight } from "lucide-react";
import useUserStore from "@/app/store/useUserStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { accountInterface } from "@/app/types/accounts.type";
import { payMongoSubs } from "@/app/utils/payMongo";
import LoadingScreen from "@/components/ui/loadingScreen";

const BASE_PRICE = 150;

const PLANS = [
  {
    key: "week",
    label: "1 Week",
    icon: CalendarDays,
    days: 7,
    discount: 0.10,
    tag: "10% off",
    desc: "Great for short-term projects.",
  },
  {
    key: "month",
    label: "1 Month",
    icon: Calendar,
    days: 30,
    discount: 0.20,
    tag: "20% off",
    desc: "Most popular for growing teams.",
    popular: true,
  },
  {
    key: "year",
    label: "1 Year",
    icon: Zap,
    days: 365,
    discount: 0.40,
    tag: "40% off",
    desc: "Best value for serious businesses.",
  },
  {
    key: "custom",
    label: "Custom",
    icon: Settings2,
    days: null,
    discount: 0,
    tag: null,
    desc: "Set your own duration.",
  },
];

function getPrice(days: number, discount: number) {
  const raw = days * BASE_PRICE;
  return Math.round(raw * (1 - discount));
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString()}`;
}

export default function Subscription() {
  const [selected, setSelected] = useState("month");
  const [customDays, setCustomDays] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUserStore();

  const { data: adminData } = useQuery({
    queryKey: ["admin"],
    queryFn: async (): Promise<accountInterface> => {
      const response = await axiosInstance.get(`/account/admin`);
      return response.data;
    },
  });

  const handleSubscribe = () => {
    if (!user || !adminData) return;
    confirmAlert(`you want to avail ${selected} Plan?`, "Avail", () => {
      const plan = PLANS.find((p) => p.key === selected)!;
      const days = plan.key === "custom" ? customDays : plan.days!;
      const price =
        plan.key === "custom"
          ? customDays * BASE_PRICE
          : getPrice(plan.days!, plan.discount);
      setIsLoading(true);
      payMongoSubs(price.toString(), user._id, adminData._id, days);
    });
  };

  const selectedPlan = PLANS.find((p) => p.key === selected)!;
  const currentDays = selectedPlan.key === "custom" ? customDays : selectedPlan.days!;
  const currentPrice =
    selectedPlan.key === "custom"
      ? customDays * BASE_PRICE
      : getPrice(selectedPlan.days!, selectedPlan.discount);
  const originalPrice =
    selectedPlan.key === "custom" ? null : selectedPlan.days! * BASE_PRICE;

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="w-full min-h-dvh bg-primary flex flex-col overflow-hidden">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Header */}
      <div className="border-b border-border px-10 py-6 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Ink Of Baphomet</span>
          </div>
          <h1
            className="text-3xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Choose a Plan
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">₱150 per day · All features included</p>
        </div>
        <div className="flex items-center gap-2 border border-border px-4 py-2">
          <Check className="w-3 h-3 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">All features included</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Plans grid */}
        <div className="flex-1 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Available Plans</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-px bg-border h-fit">
            {PLANS.map(({ key, label, icon: Icon, days, discount, tag, desc, popular }) => {
              const isSelected = selected === key;
              const price = key !== "custom" && days ? getPrice(days, discount) : null;
              const orig = key !== "custom" && days ? days * BASE_PRICE : null;

              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`group relative flex flex-col justify-between p-7 text-left transition-all duration-300 cursor-pointer overflow-hidden
                    ${isSelected
                      ? "bg-surface-alt border-0"
                      : "bg-surface hover:bg-surface-alt border-0"
                    }`}
                >
                  {/* Gold bottom reveal */}
                  <div className={`absolute bottom-0 left-0 h-[1px] bg-gold transition-all duration-700 ${isSelected ? "w-full" : "w-0 group-hover:w-full"}`} />

                  {/* Left accent */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-gold" />
                  )}

                  {/* Popular badge */}
                  {popular && (
                    <div className={`absolute top-4 right-4 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${isSelected ? "border-gold text-gold bg-surface" : "border-border text-text-muted bg-surface-alt"}`}>
                      Popular
                    </div>
                  )}

                  {/* Ghost index */}
                  <span
                    className="absolute bottom-4 right-5 text-5xl font-light text-text-dim select-none pointer-events-none opacity-50"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {String(PLANS.findIndex(p => p.key === key) + 1).padStart(2, "0")}
                  </span>

                  {/* Top content */}
                  <div className="space-y-4">
                    <div className={`w-9 h-9 flex items-center justify-center border transition-all duration-300 ${isSelected ? "border-gold bg-surface-alt" : "border-border bg-surface-alt"}`}>
                      <Icon className={`w-4 h-4 ${isSelected ? "text-gold" : "text-text-muted"}`} />
                    </div>

                    <div>
                      <div
                        className={`font-light text-xl tracking-wide ${isSelected ? "text-text" : "text-text-muted"}`}
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {label}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-text-dim mt-1">{desc}</div>
                    </div>

                    {tag && (
                      <div className={`inline-flex text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${isSelected ? "border-gold text-gold" : "border-border text-text-dim"}`}>
                        {tag}
                      </div>
                    )}

                    {/* Custom days input */}
                    {key === "custom" && (
                      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">
                          Number of days
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={customDays}
                          disabled={!isSelected}
                          onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                          className={`w-28 px-3 py-2 text-sm font-light border bg-primary text-text focus:outline-none transition-all
                            ${isSelected
                              ? "border-gold focus:border-gold"
                              : "border-border text-text-dim cursor-not-allowed"
                            }`}
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    {key === "custom" ? (
                      <div>
                        <div
                          className={`text-2xl font-light ${isSelected ? "text-gold" : "text-text-muted"}`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {formatPeso(customDays * BASE_PRICE)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-text-dim mt-1">₱{BASE_PRICE}/day</div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={`text-2xl font-light ${isSelected ? "text-gold" : "text-text-muted"}`}
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {formatPeso(price!)}
                        </div>
                        {discount > 0 && (
                          <div className="text-[11px] line-through text-text-dim mt-0.5">
                            {formatPeso(orig!)}
                          </div>
                        )}
                        <div className="text-[10px] uppercase tracking-[0.16em] text-text-dim mt-1">
                          for {days} day{days! > 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-4 left-4 w-4 h-4 bg-gold flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Summary */}
        <div className="lg:w-[320px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-border p-8 flex flex-col justify-between bg-secondary">

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-4 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Order Summary</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Plan</span>
                  <span
                    className="text-sm font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {selectedPlan.label}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Duration</span>
                  <span
                    className="text-sm font-light text-text"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {currentDays} day{currentDays > 1 ? "s" : ""}
                  </span>
                </div>

                {originalPrice && originalPrice !== currentPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Discount</span>
                    <span className="text-sm font-light text-success-light">
                      −{formatPeso(originalPrice - currentPrice)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-4 flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Total</span>
                  <span
                    className="text-3xl font-light text-gold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {formatPeso(currentPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {["Full access to all features", "Affordable daily rate", "No hidden charges"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-gold flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-gold" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-text-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="relative mt-8">
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold opacity-40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold opacity-40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />
            <div className="p-4">
              <Button onClick={handleSubscribe} className="w-full">
                Subscribe Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}