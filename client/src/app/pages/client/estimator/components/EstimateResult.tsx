"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  Flame,
  Info,
  LoaderCircle,
  MapPin,
  Palette,
  RotateCcw,
  Ruler,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeso } from "@/app/utils/customFunction";
import { clientTattooEstimateInterface } from "@/app/types/aiAnalysis.type";

const range = (
  min: number,
  max: number,
  format: (n: number) => string = String,
) => (min === max ? format(min) : `${format(min)} – ${format(max)}`);

export function EstimateResult({
  result,
  isRecalculating,
  staleReason,
  recalcError,
  onStartOver,
}: {
  result: clientTattooEstimateInterface;
  isRecalculating: boolean;
  staleReason?: string;
  recalcError?: string;
  onStartOver: () => void;
}) {
  const dim = isRecalculating || !!staleReason;

  return (
    <div className="relative border border-gold-dim bg-surface overflow-hidden">
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />

      <div className="px-5 pt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
            AI Tattoo Estimate
          </span>
        </div>
        <Badge variant="secondary">Estimate</Badge>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Estimated Tattoo Price
          </p>
          {isRecalculating && (
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-text-dim">
              <LoaderCircle className="w-3 h-3 animate-spin" /> Updating
            </span>
          )}
        </div>
        <h2
          key={`${result.price.min}-${result.price.max}`}
          className={`text-3xl sm:text-4xl font-light text-gold price-pop transition-opacity ${dim ? "opacity-60" : ""}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          aria-live="polite"
        >
          {range(result.price.min, result.price.max, formatPeso)}
        </h2>
        {staleReason && (
          <p className="mt-2 text-[11px] text-text-dim">{staleReason}</p>
        )}
        {recalcError && (
          <p className="mt-2 text-[11px] text-danger-light" role="alert">
            {recalcError}
          </p>
        )}
      </div>

      <div
        className={`px-5 py-4 border-t border-border grid grid-cols-2 gap-4 transition-opacity ${dim ? "opacity-60" : ""}`}
      >
        <Stat icon={MapPin} label="Body Part" value={result.bodyPart} />
        <Stat
          icon={Ruler}
          label="Size"
          value={`${result.size.widthCm} × ${result.size.heightCm} cm`}
          note={result.size.source === "ai" ? "AI visual estimate" : undefined}
        />
        <Stat icon={Palette} label="Style" value={result.style} />
        <Stat
          icon={Flame}
          label="Complexity"
          value={`${result.complexity} / 5`}
        />
        <Stat
          icon={Palette}
          label="Color"
          value={result.isColored ? "Colored" : "Black & Gray"}
        />
        <Stat
          icon={CalendarDays}
          label="Estimated Sessions"
          value={range(result.sessions.min, result.sessions.max)}
        />
        <Stat
          icon={Timer}
          label="Estimated Time"
          value={`${range(result.hours.min, result.hours.max)} hrs`}
        />
      </div>

      <div className="px-5 py-4 border-t border-border">
        <p className="flex items-start gap-2 text-xs text-text-muted leading-relaxed">
          <Info className="w-4 h-4 text-gold shrink-0 mt-px" />
          This is only an AI-generated estimate. Final price may vary after
          artist consultation, depending on the artist, exact size, placement
          and design details.
        </p>
      </div>

      <div className="p-5 border-t border-border flex flex-col gap-3">
        <Button asChild>
          <Link
            href={`/pages/client/posts?category=${encodeURIComponent(result.style)}`}
          >
            <CalendarCheck className="w-4 h-4" /> Book a Consultation
          </Link>
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          <RotateCcw className="w-4 h-4" /> Estimate Another
        </Button>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-1.5 text-text-dim">
        <Icon className="w-3.5 h-3.5 text-gold shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.14em] truncate">
          {label}
        </span>
      </div>
      <p className="text-sm text-text">{value}</p>
      {note && (
        <p className="text-[10px] uppercase tracking-[0.12em] text-text-dim">
          {note}
        </p>
      )}
    </div>
  );
}
