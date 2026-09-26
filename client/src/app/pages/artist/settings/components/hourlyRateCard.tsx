"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Wallet } from "lucide-react";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { formatPeso } from "@/app/utils/customFunction";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import { firstError } from "@/lib/validation/fields";
import { hourlyRateSchema } from "@/lib/validation/schemas/artistSettings";
import {
  ARTIST_SETTINGS_QUERY_KEY,
  artistSettingsInterface,
  useArtistSettings,
} from "@/app/hooks/artistSettingsHooks";

const errorText = (error: unknown) => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return typeof data === "string" && data ? data : "Could not save your hourly rate";
};

export function HourlyRateCard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useArtistSettings();
  const saved = data?.hourlyRate ?? null;

  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (saved !== null) setValue(String(saved));
  }, [saved]);

  const mutation = useMutation({
    mutationFn: (hourlyRate: number) =>
      axiosInstance.put<artistSettingsInterface>("/artist/settings/hourly-rate", {
        hourlyRate,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(ARTIST_SETTINGS_QUERY_KEY, data);
      successAlert("Hourly rate saved");
      setTouched(false);
    },
    onError: (error) => errorAlert(errorText(error)),
  });

  const error = firstError(hourlyRateSchema, value, { showWhenEmpty: touched });
  const parsed = hourlyRateSchema.safeParse(value);
  const unchanged = parsed.success && parsed.data === saved;

  const save = () => {
    setTouched(true);
    if (!parsed.success || unchanged) return;
    mutation.mutate(parsed.data);
  };

  return (
    <div className="flex items-start gap-4 bg-surface border border-border p-5">
      <div className="bg-surface-alt border border-border p-3 flex-shrink-0">
        <Wallet className="w-5 h-5 text-gold" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div>
          <h2
            className="text-xl font-light text-text"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Hourly Rate
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Used to price your posts and bookings (AI Tattoo Analysis labor
            cost).{" "}
            {saved !== null ? (
              <span className="text-text">Current: {formatPeso(saved)} / hour</span>
            ) : (
              !isLoading && !isError && <span className="text-gold">Not set yet.</span>
            )}
          </p>
        </div>

        {isError ? (
          <p className="text-sm text-danger-light">
            Could not load your hourly rate. Please refresh the page.
          </p>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="hourly-rate">Rate per hour</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 max-w-[220px]">
                <MoneyInput
                  id="hourly-rate"
                  placeholder={isLoading ? "Loading…" : "0.00"}
                  value={value}
                  disabled={isLoading}
                  onChange={setValue}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  aria-invalid={!!error}
                />
              </div>
              <Button
                onClick={save}
                disabled={isLoading || mutation.isPending || !parsed.success || unchanged}
              >
                {mutation.isPending && <LoaderCircle className="w-4 h-4 animate-spin" />}
                Save
              </Button>
            </div>
            <FieldError>{error}</FieldError>
          </div>
        )}
      </div>
    </div>
  );
}
