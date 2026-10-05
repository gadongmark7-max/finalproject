"use client";

import { Clock, Sparkles } from "lucide-react";
import { estimatorUsageInterface } from "@/app/types/aiAnalysis.type";
import { formatCountdown } from "./useEstimatorUsage";

export function EstimatorUsageStatus({
  usage,
  isLoading,
  isError,
  isBlocked,
  isCoolingDown,
  cooldownMs,
}: {
  usage?: estimatorUsageInterface;
  isLoading: boolean;
  isError: boolean;
  isBlocked: boolean;
  isCoolingDown: boolean;
  cooldownMs: number;
}) {
  return (
    <div
      className={`border px-4 py-3 space-y-2 ${
        isBlocked
          ? "border-danger-border bg-danger-muted"
          : "border-border bg-surface-alt"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
          <Sparkles className="w-3 h-3" /> AI Estimator
        </span>
        {usage && (
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: usage.limit }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-1.5 border border-gold ${
                  i < usage.remaining ? "bg-gold" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-text-muted">Checking your remaining tests…</p>
      )}
      {!isLoading && isError && !usage && (
        <p className="text-xs text-text-muted">
          Couldn&apos;t load your remaining tests right now.
        </p>
      )}
      {usage && !isBlocked && (
        <p
          className="text-lg font-light text-text"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {usage.remaining} / {usage.limit} tests remaining
        </p>
      )}
      {usage && isBlocked && (
        <>
          <p
            className="text-lg font-light text-danger-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            No tests remaining
          </p>
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <Clock className="w-3.5 h-3.5 text-gold" />
            {isCoolingDown ? (
              <>
                Available again in{" "}
                <span className="tabular-nums text-text">
                  {formatCountdown(cooldownMs)}
                </span>
              </>
            ) : (
              "Refreshing your allowance…"
            )}
          </p>
        </>
      )}
    </div>
  );
}
