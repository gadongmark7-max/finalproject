"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert } from "@/app/utils/alert";
import { apiErrorMessage } from "@/app/utils/customFunction";
import { moneyField, positiveDecimalField } from "@/lib/validation/fields";
import { tattooArtStyles } from "@/components/ui/artStyleSelect";
import { aiAnalysisResultInterface } from "@/app/types/aiAnalysis.type";

const RECALC_DEBOUNCE_MS = 400;

export const aiRateSchema = moneyField({ label: "Rate" });
export const aiSizeWidthSchema = positiveDecimalField({
  label: "Width",
  max: 100,
});
export const aiSizeHeightSchema = positiveDecimalField({
  label: "Height",
  max: 100,
});

interface Inputs {
  postImg: File | null;
  bodyPart: string;
  perHour: string;
  sizeWidthCm: string;
  sizeHeightCm: string;
  category: string;
  complexity: number;
  isColored: boolean;
}

type RepricePayload = {
  category: string;
  complexity: number;
  isColored: boolean;
  bodyPart: string;
  hourlyRate: number;
  sizeWidthCm: number;
  sizeHeightCm: number;
  calibration: aiAnalysisResultInterface["calibration"];
  materials: aiAnalysisResultInterface["baseMaterials"];
};

export function useArtistAiAnalysis(
  inputs: Inputs,
  { onAnalyzed }: { onAnalyzed: (result: aiAnalysisResultInterface) => void },
) {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState<aiAnalysisResultInterface | null>(
    null,
  );
  const materialNames = useRef(new Map<string, string>());
  const [debouncedPayload, setDebouncedPayload] =
    useState<RepricePayload | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (data: FormData) =>
      axiosInstance.post<aiAnalysisResultInterface>("/post/ai-analysis", data),
    onSuccess: ({ data: result }) => {
      materialNames.current = new Map(
        result.materials.map((m) => [m.inventoryItemId, m.name]),
      );
      const seed = payloadFor(result, result.pricing.hourlyRate);
      queryClient.setQueryData(["ai-reprice", seed], result);
      setDebouncedPayload(seed);
      setAnalysis(result);
      onAnalyzed(result);
      successAlert("AI analysis complete");
    },
    onError: (error) =>
      errorAlert(
        apiErrorMessage(
          error,
          "Could not analyze this tattoo right now. Please try again.",
        ),
      ),
  });

  const { payload, invalidReason } = useMemo((): {
    payload: RepricePayload | null;
    invalidReason?: string;
  } => {
    if (!analysis) return { payload: null };
    const rate = aiRateSchema.safeParse(inputs.perHour);
    const width = aiSizeWidthSchema.safeParse(inputs.sizeWidthCm);
    const height = aiSizeHeightSchema.safeParse(inputs.sizeHeightCm);
    if (!inputs.bodyPart)
      return {
        payload: null,
        invalidReason: "Select a body part to update the estimate.",
      };
    if (!rate.success)
      return {
        payload: null,
        invalidReason: "Enter a valid hourly rate to update the estimate.",
      };
    if (!width.success || !height.success)
      return {
        payload: null,
        invalidReason: "Enter a valid width and height to update the estimate.",
      };

    return {
      payload: {
        category: (tattooArtStyles as readonly string[]).includes(
          inputs.category,
        )
          ? inputs.category
          : analysis.analysis.category,
        complexity:
          inputs.complexity >= 1 && inputs.complexity <= 5
            ? inputs.complexity
            : analysis.analysis.complexity,
        isColored: inputs.isColored,
        bodyPart: inputs.bodyPart,
        hourlyRate: rate.data as number,
        sizeWidthCm: width.data,
        sizeHeightCm: height.data,
        calibration: analysis.calibration,
        materials: analysis.baseMaterials,
      },
    };
  }, [analysis, inputs]);

  const payloadKey = payload ? JSON.stringify(payload) : null;
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedPayload(payload),
      RECALC_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [payloadKey]);

  const repriceQuery = useQuery({
    queryKey: ["ai-reprice", debouncedPayload],
    queryFn: async () =>
      (
        await axiosInstance.post<aiAnalysisResultInterface>(
          "/post/ai-analysis/reprice",
          debouncedPayload,
        )
      ).data,
    enabled: !!analysis && !!debouncedPayload,
    placeholderData: (prev) => prev,
    staleTime: Infinity,
    retry: false,
  });

  const result = (analysis && repriceQuery.data) || analysis;
  const isDebouncing =
    !!payloadKey && payloadKey !== JSON.stringify(debouncedPayload);

  const missingMaterialNames = (result?.missingMaterialIds ?? []).map(
    (id) => materialNames.current.get(id) ?? "Unknown item",
  );

  const analyze = () => {
    if (analyzeMutation.isPending) return;
    const formData = new FormData();
    formData.append("file", inputs.postImg!);
    formData.append("bodyPart", inputs.bodyPart);
    formData.append("hourlyRate", inputs.perHour);
    formData.append("sizeWidthCm", inputs.sizeWidthCm);
    formData.append("sizeHeightCm", inputs.sizeHeightCm);
    analyzeMutation.mutate(formData);
  };

  const reset = () => {
    setAnalysis(null);
    setDebouncedPayload(null);
  };

  return {
    result,
    analyze,
    reset,
    isAnalyzing: analyzeMutation.isPending,
    isRecalculating: !!analysis && (isDebouncing || repriceQuery.isFetching),
    staleReason: analysis ? invalidReason : undefined,
    recalcError: repriceQuery.isError
      ? apiErrorMessage(
          repriceQuery.error,
          "Could not update the estimate. Please try again.",
        )
      : undefined,
    missingMaterialNames,
  };
}

function payloadFor(
  result: aiAnalysisResultInterface,
  hourlyRate: number,
): RepricePayload {
  return {
    category: result.analysis.category,
    complexity: result.analysis.complexity,
    isColored: result.analysis.isColored,
    bodyPart: result.analysis.bodyPart,
    hourlyRate,
    sizeWidthCm: result.size.widthCm,
    sizeHeightCm: result.size.heightCm,
    calibration: result.calibration,
    materials: result.baseMaterials,
  };
}
