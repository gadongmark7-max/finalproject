"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import { clientTattooEstimateInterface } from "@/app/types/aiAnalysis.type";

const RECALC_DEBOUNCE_MS = 400;

type RepricePayload = {
  estimateToken: string;
  bodyPart: string;
  sizeWidthCm: number;
  sizeHeightCm: number;
};

export function useClientEstimate(current: {
  bodyPart: string;
  size: { widthCm: number; heightCm: number } | null;
}) {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] =
    useState<clientTattooEstimateInterface | null>(null);
  const [debounced, setDebounced] = useState<RepricePayload | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post<clientTattooEstimateInterface>(
        "/post/ai-estimate",
        data,
      ),
    onSuccess: ({ data }) => {
      const seed = {
        estimateToken: data.estimateToken,
        bodyPart: data.bodyPart,
        sizeWidthCm: data.size.widthCm,
        sizeHeightCm: data.size.heightCm,
      };
      queryClient.setQueryData(["client-ai-reprice", seed], data);
      setDebounced(seed);
      setAnalysis(data);
    },
    onError: (error) =>
      errorAlert(
        apiErrorMessage(
          error,
          "Could not estimate this tattoo right now. Please try again.",
        ),
      ),
  });

  const payload: RepricePayload | null =
    analysis && current.bodyPart && current.size
      ? {
          estimateToken: analysis.estimateToken,
          bodyPart: current.bodyPart,
          sizeWidthCm: current.size.widthCm,
          sizeHeightCm: current.size.heightCm,
        }
      : null;
  const payloadKey = payload ? JSON.stringify(payload) : null;

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(payload), RECALC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [payloadKey]);

  const repriceQuery = useQuery({
    queryKey: ["client-ai-reprice", debounced],
    queryFn: async () =>
      (
        await axiosInstance.post<clientTattooEstimateInterface>(
          "/post/ai-estimate/reprice",
          debounced,
        )
      ).data,
    enabled: !!analysis && !!debounced,
    placeholderData: (prev) => prev,
    staleTime: Infinity,
    retry: false,
  });

  const result = (analysis && repriceQuery.data) || analysis;
  const isDebouncing = !!payloadKey && payloadKey !== JSON.stringify(debounced);

  return {
    result,
    analyze: (data: FormData) => {
      if (!analyzeMutation.isPending) analyzeMutation.mutate(data);
    },
    reset: () => {
      setAnalysis(null);
      setDebounced(null);
    },
    isAnalyzing: analyzeMutation.isPending,
    isRecalculating: !!analysis && (isDebouncing || repriceQuery.isFetching),
    staleReason:
      analysis && !payload
        ? current.bodyPart
          ? "Enter a valid width and height to update the estimate."
          : "Select a body part to update the estimate."
        : undefined,
    recalcError: repriceQuery.isError
      ? apiErrorMessage(
          repriceQuery.error,
          "Could not update the estimate. Please try again.",
        )
      : undefined,
  };
}
