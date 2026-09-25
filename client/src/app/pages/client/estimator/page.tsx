"use client";

import { useEffect, useRef, useState } from "react";
import { Box, ImageIcon, LoaderCircle, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { AiProgressSteps } from "@/components/ui/ai-progress-steps";
import { BodyPartSelect, bodyParts } from "@/components/ui/bodyPartSelect";
import { SetTattoo3DModal } from "@/app/3d/3dTattooModal";
import { TattooDataInterface } from "@/app/types/threejs.type";
import { useImageField } from "@/lib/validation/useFileField";
import { firstError, positiveDecimalField } from "@/lib/validation/fields";
import {
  cmToDecalSize,
  decalSizeToCm,
  tattooSizeCmFromScene,
} from "@/app/utils/tattooScale";
import { EstimateResult } from "./components/EstimateResult";
import { useClientEstimate } from "./components/useClientEstimate";

const STEPS = [
  "Reading tattoo design",
  "Detecting style",
  "Evaluating complexity",
  "Checking color",
  "Calculating tattoo size",
  "Checking body placement",
  "Estimating price",
];

const widthSchema = positiveDecimalField({ label: "Width", max: 100 });
const heightSchema = positiveDecimalField({ label: "Height", max: 100 });

const isModelBodyPart = (value: string) =>
  (bodyParts as readonly string[]).includes(value);

export default function Page() {
  const image = useImageField({ maxMB: 8 });
  const [fileInputKey, setFileInputKey] = useState(0);

  const [tattooData, setTatooData] = useState<TattooDataInterface | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [snapshotSideCm, setSnapshotSideCm] = useState<number | null>(null);
  const snapshotPending = useRef(false);
  const lastPlacement = useRef<string | null>(null);

  const [bodyPart, setBodyPart] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  const widthError = width ? firstError(widthSchema, width) : undefined;
  const heightError = height ? firstError(heightSchema, height) : undefined;
  const pairError =
    !!width !== !!height
      ? "Enter both width and height, or leave both empty."
      : undefined;
  const parsedWidth = widthSchema.safeParse(width);
  const parsedHeight = heightSchema.safeParse(height);
  const size =
    parsedWidth.success && parsedHeight.success
      ? { widthCm: parsedWidth.data, heightCm: parsedHeight.data }
      : null;

  const imageError =
    image.error ??
    (triedSubmit && !image.file ? "Please upload a tattoo image." : undefined);
  const bodyPartError =
    triedSubmit && !bodyPart
      ? "Place the tattoo on the 3D body (or pick a body part)."
      : undefined;

  const estimate = useClientEstimate({ bodyPart, size });

  useEffect(() => {
    if (!tattooData) return;
    const { widthCm: sideCm } = tattooSizeCmFromScene(tattooData);
    if (snapshotPending.current) {
      snapshotPending.current = false;
      setSnapshotSideCm(sideCm);
    }

    const { x, y, z } = tattooData.position;
    const placement = `${tattooData.meshName}|${x},${y},${z}`;
    if (placement !== lastPlacement.current) {
      lastPlacement.current = placement;
      if (isModelBodyPart(tattooData.meshName))
        setBodyPart(tattooData.meshName);
    }

    const w = widthSchema.safeParse(width);
    const h = heightSchema.safeParse(height);
    if (!w.success || !h.success) {
      setWidth(String(sideCm));
      setHeight(String(sideCm));
      return;
    }
    const longest = Math.max(w.data, h.data);
    if (Math.abs(longest - sideCm) >= 0.5) {
      const factor = sideCm / longest;
      setWidth(String(Math.round(w.data * factor * 2) / 2 || 0.5));
      setHeight(String(Math.round(h.data * factor * 2) / 2 || 0.5));
    }
  }, [tattooData]);

  const onSizeChange = (nextWidth: string, nextHeight: string) => {
    setWidth(nextWidth);
    setHeight(nextHeight);
    const w = widthSchema.safeParse(nextWidth);
    const h = heightSchema.safeParse(nextHeight);
    if (tattooData && w.success && h.success) {
      setTatooData({
        ...tattooData,
        size: cmToDecalSize(w.data, h.data, tattooData.cmPerUnit),
      });
    }
  };

  const onImageSelect = (file: File | null) => {
    image.onSelect(file);
    setTatooData(null);
    setSnapshot(null);
    setSnapshotSideCm(null);
    lastPlacement.current = null;
    estimate.reset();
  };

  const analyze = () => {
    if (estimate.isAnalyzing) return;
    setTriedSubmit(true);
    if (!image.file || !bodyPart || widthError || heightError || pairError)
      return;

    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("bodyPart", bodyPart);
    if (size) {
      formData.append("sizeWidthCm", String(size.widthCm));
      formData.append("sizeHeightCm", String(size.heightCm));
    }
    estimate.analyze(formData);
  };

  const startOver = () => {
    onImageSelect(null);
    image.reset();
    setBodyPart("");
    setWidth("");
    setHeight("");
    setTriedSubmit(false);
    setFileInputKey((k) => k + 1);
  };

  const previewOutdated =
    !!snapshot &&
    !!size &&
    snapshotSideCm !== null &&
    Math.abs(Math.max(size.widthCm, size.heightCm) - snapshotSideCm) >= 0.5;

  return (
    <div className="w-full px-4 sm:px-6 py-10 lg:py-16 min-h-dvh bg-primary">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              AI Playground
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            AI Tattoo Price Estimator
          </h1>
          <p className="text-sm text-text-muted mt-3 max-w-xl">
            Upload a tattoo you like, place it on the body, and get an
            approximate price range. Nothing is booked or shared with an artist.
          </p>
        </div>

        <div className="bg-surface border border-border p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <Label>Upload your tattoo design</Label>
            <span className="text-[10px] uppercase tracking-[0.18em] px-3 py-1 border border-gold-dim text-gold bg-surface-alt">
              Required
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 border border-border bg-primary overflow-hidden flex items-center justify-center">
              {image.preview ? (
                <img
                  src={image.preview}
                  alt="Selected tattoo design"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-text-dim" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <Input
                key={fileInputKey}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-invalid={!!imageError}
                onChange={(e) => onImageSelect(e.target.files?.[0] || null)}
              />
              <FieldError>{imageError}</FieldError>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-5 items-start">
          <div className="bg-surface border border-border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Box className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                3D Body Placement
              </span>
            </div>

            <div className="relative border border-border bg-primary w-full h-[300px] sm:h-[420px] overflow-hidden">
              {snapshot ? (
                <>
                  <img
                    src={snapshot}
                    alt={`Tattoo placed on the ${bodyPart || "body"} in 3D`}
                    className="w-full h-full object-contain"
                  />
                  {bodyPart && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-secondary/90 border border-border-gold text-[10px] uppercase tracking-[0.2em] text-gold">
                      {bodyPart}
                    </span>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center text-text-dim">
                  <MapPin className="w-8 h-8" />
                  <p className="text-xs leading-relaxed max-w-xs">
                    {image.preview
                      ? "Open the 3D body, tap where you want the tattoo, adjust its size, then save."
                      : "Upload a design first, then place it on the 3D body."}
                  </p>
                </div>
              )}
            </div>
            {previewOutdated && (
              <p className="text-[11px] text-text-dim">
                Size changed — reopen the 3D body to refresh this preview.
              </p>
            )}

            {image.preview ? (
              <SetTattoo3DModal
                key={image.preview}
                img={image.preview}
                tattooData={tattooData}
                setTatooData={setTatooData}
                fixSize={null}
                onSnapshot={(url) => {
                  setSnapshot(url);
                  snapshotPending.current = true;
                }}
              />
            ) : (
              <Button variant="outline" className="w-full" disabled>
                <MapPin className="w-4 h-4" /> Select tattoo position
              </Button>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-6">
            <div className="bg-surface border border-border p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Tattoo Information
                </span>
              </div>

              <div className="space-y-2">
                <Label>Selected Body Part</Label>
                <p
                  className="text-2xl font-light text-text"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  aria-live="polite"
                >
                  {bodyPart || "Not selected"}
                </p>
                {tattooData?.meshName === "Unknown" && (
                  <p className="text-[11px] text-danger-light">
                    That spot wasn&apos;t on the body — reopen the 3D view and
                    tap directly on the body.
                  </p>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                    Or pick from the list
                  </span>
                  <BodyPartSelect value={bodyPart} onChange={setBodyPart} />
                </div>
                <FieldError>{bodyPartError}</FieldError>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tattoo Size (cm)</Label>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
                    {tattooData ? "From 3D placement" : "Optional"}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                  <div className="space-y-1">
                    <Input
                      placeholder="Width"
                      inputMode="decimal"
                      value={width}
                      aria-label="Width in centimeters"
                      aria-invalid={!!widthError}
                      onChange={(e) =>
                        onSizeChange(
                          e.target.value.replace(/[^0-9.]/g, ""),
                          height,
                        )
                      }
                    />
                    <FieldError>{widthError}</FieldError>
                  </div>
                  <span className="h-10 flex items-center text-text-dim">
                    ×
                  </span>
                  <div className="space-y-1">
                    <Input
                      placeholder="Height"
                      inputMode="decimal"
                      value={height}
                      aria-label="Height in centimeters"
                      aria-invalid={!!heightError}
                      onChange={(e) =>
                        onSizeChange(
                          width,
                          e.target.value.replace(/[^0-9.]/g, ""),
                        )
                      }
                    />
                    <FieldError>{heightError}</FieldError>
                  </div>
                </div>
                <FieldError>{pairError}</FieldError>
                <p className="text-[11px] text-text-dim">
                  {tattooData
                    ? `Resizing the tattoo on the 3D body updates this (≈ ${decalSizeToCm(tattooData.size, tattooData.cmPerUnit)} cm on the model).`
                    : "Leave empty and the AI will guess a typical size."}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={analyze}
                disabled={estimate.isAnalyzing}
              >
                {estimate.isAnalyzing ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {estimate.isAnalyzing
                  ? "Analyzing…"
                  : estimate.result
                    ? "Re-analyze Tattoo"
                    : "Analyze Tattoo"}
              </Button>
              {estimate.result && !estimate.isAnalyzing && (
                <p className="text-[11px] text-text-dim text-center">
                  Changing the body part or size updates the price
                  automatically.
                </p>
              )}
            </div>

            {estimate.isAnalyzing && (
              <AiProgressSteps title="Analyzing your tattoo..." steps={STEPS} />
            )}

            {!estimate.isAnalyzing && estimate.result && (
              <EstimateResult
                result={estimate.result}
                isRecalculating={estimate.isRecalculating}
                staleReason={estimate.staleReason}
                recalcError={estimate.recalcError}
                onStartOver={startOver}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
