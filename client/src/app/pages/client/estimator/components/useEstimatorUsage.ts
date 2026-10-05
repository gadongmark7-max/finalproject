"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { estimatorUsageInterface } from "@/app/types/aiAnalysis.type";

export const ESTIMATOR_USAGE_QUERY_KEY = ["client-ai-estimator-usage"];

type TimedUsage = estimatorUsageInterface & { clockOffsetMs: number };

export const withClockOffset = (
  usage: estimatorUsageInterface,
): TimedUsage => {
  const serverMs = new Date(usage.serverTime).getTime();
  return {
    ...usage,
    clockOffsetMs: Number.isFinite(serverMs) ? serverMs - Date.now() : 0,
  };
};

export const usageFromError = (
  error: unknown,
): estimatorUsageInterface | null => {
  const usage = (error as { response?: { data?: { usage?: unknown } } })
    ?.response?.data?.usage;
  return usage && typeof usage === "object"
    ? (usage as estimatorUsageInterface)
    : null;
};

export const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
};

export function useEstimatorUsage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ESTIMATOR_USAGE_QUERY_KEY,
    queryFn: async () =>
      withClockOffset(
        (
          await axiosInstance.get<estimatorUsageInterface>(
            "/post/ai-estimate/usage",
          )
        ).data,
      ),
    refetchOnWindowFocus: true,
  });

  const usage = query.data;
  const cooldownEndMs = usage?.cooldownUntil
    ? new Date(usage.cooldownUntil).getTime()
    : null;

  const computeRemaining = () =>
    cooldownEndMs === null || !usage
      ? 0
      : Math.max(0, cooldownEndMs - (Date.now() + usage.clockOffsetMs));

  const [cooldownMs, setCooldownMs] = useState(computeRemaining);

  useEffect(() => {
    setCooldownMs(computeRemaining());
    if (cooldownEndMs === null) return;
    const timer = setInterval(() => {
      const remaining = computeRemaining();
      setCooldownMs(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        queryClient.invalidateQueries({ queryKey: ESTIMATOR_USAGE_QUERY_KEY });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownEndMs, usage?.clockOffsetMs]);

  const isCoolingDown = cooldownEndMs !== null && cooldownMs > 0;
  const isBlocked = !!usage && (isCoolingDown || usage.remaining <= 0);

  return {
    usage,
    isLoading: query.isLoading,
    isError: query.isError,
    cooldownMs,
    isCoolingDown,
    isBlocked,
    setUsage: (next: estimatorUsageInterface) =>
      queryClient.setQueryData(ESTIMATOR_USAGE_QUERY_KEY, withClockOffset(next)),
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: ESTIMATOR_USAGE_QUERY_KEY }),
  };
}
