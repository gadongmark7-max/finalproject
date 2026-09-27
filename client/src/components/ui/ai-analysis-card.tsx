"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Cpu,
  Flame,
  LoaderCircle,
  MapPin,
  Package,
  Palette,
  Ruler,
  Settings,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { FieldError } from "@/components/ui/field-error";
import { BodyPartSelect } from "@/components/ui/bodyPartSelect";
import { AiProgressSteps } from "@/components/ui/ai-progress-steps";
import { formatPeso } from "@/app/utils/customFunction";
import { aiAnalysisResultInterface } from "@/app/types/aiAnalysis.type";

export function profitAtPrice(
  price: string,
  pricing: aiAnalysisResultInterface["pricing"],
) {
  const n = price.trim() === "" ? NaN : Number(price);
  if (!Number.isFinite(n) || n < 0) {
    return {
      price: pricing.suggestedPrice,
      profit: pricing.estimatedProfit,
      isSuggested: true,
    };
  }
  return {
    price: n,
    profit: Math.round((n - pricing.totalCost) * 100) / 100,
    isSuggested: false,
  };
}

const ANALYSIS_STEPS = [
  "Analyzing style",
  "Evaluating complexity",
  "Checking body position",
  "Estimating size",
  "Estimating tattoo time",
  "Checking materials",
  "Calculating estimated price",
];

interface AiAnalysisCardProps {
  result: aiAnalysisResultInterface | null;
  isAnalyzing: boolean;
  /** A recalculation for changed inputs is pending or in flight. */
  isRecalculating: boolean;
  /** Inputs are currently invalid, so the shown estimate is out of date. */
  staleReason?: string;
  recalcError?: string;
  missingMaterialNames: string[];

  bodyPart: string;
  onBodyPartChange: (value: string) => void;
  hourlyRate: number | null;
  hourlyRateLoading?: boolean;
  sizeLabel: string | null;
  sizeFromScene: boolean;

  price: string;
  onPriceChange: (value: string) => void;
  priceError?: string;

  analyzeDisabledReason?: string;
  onAnalyze: () => void;
  onApply: () => void;
  applyTarget?: string;
}

const SETTINGS_HREF = "/pages/artist/settings";

export function AiAnalysisCard(props: AiAnalysisCardProps) {
  const {
    result,
    isAnalyzing,
    isRecalculating,
    staleReason,
    recalcError,
    missingMaterialNames,
  } = props;

  return (
    <div className="relative border border-gold-dim bg-surface overflow-hidden">
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />

      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
            AI Tattoo Analysis
          </span>
        </div>
        <Badge variant="secondary">AI Estimate</Badge>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Body Part</Label>
            <BodyPartSelect
              value={props.bodyPart}
              onChange={props.onBodyPartChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-hourly-rate">Hourly Rate</Label>
            <MoneyInput
              id="ai-hourly-rate"
              value={
                props.hourlyRate !== null
                  ? `${props.hourlyRate.toLocaleString()} / hour`
                  : ""
              }
              placeholder={props.hourlyRateLoading ? "Loading…" : "Not set"}
              onChange={() => {}}
              readOnly
              disabled
              aria-describedby="ai-hourly-rate-help"
            />
          </div>
        </div>
        <p
          id="ai-hourly-rate-help"
          className="flex items-center gap-1.5 text-[11px] text-text-dim -mt-2"
        >
          <Settings className="w-3 h-3 shrink-0" />
          {props.hourlyRate === null && !props.hourlyRateLoading
            ? "Set your hourly rate in"
            : "Hourly rate is managed in"}{" "}
          <Link href={SETTINGS_HREF} className="text-gold hover:underline">
            Settings
          </Link>
        </p>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-text-muted">Tattoo size</span>
          <span className="text-text text-right">
            {props.sizeLabel ?? "Enter width × height in the form"}
            {props.sizeLabel && (
              <span className="block text-[10px] uppercase tracking-[0.14em] text-text-dim">
                {props.sizeFromScene
                  ? "Estimated from 3D placement"
                  : "Entered manually"}
              </span>
            )}
          </span>
        </div>

        <Button
          className="w-full"
          onClick={props.onAnalyze}
          disabled={isAnalyzing || !!props.analyzeDisabledReason}
        >
          {isAnalyzing ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <Cpu className="w-4 h-4" />
          )}
          {isAnalyzing
            ? "Analyzing…"
            : result
              ? "Re-analyze Tattoo"
              : "Analyze Tattoo"}
        </Button>
        {props.analyzeDisabledReason && !isAnalyzing && (
          <p className="text-[11px] text-text-dim text-center">
            {props.analyzeDisabledReason}
          </p>
        )}
      </div>

      {isAnalyzing && (
        <div className="px-5 pb-5">
          <AiProgressSteps title="Analyzing tattoo..." steps={ANALYSIS_STEPS} />
        </div>
      )}

      {!isAnalyzing && !result && (
        <div className="px-5 pb-5">
          <p className="text-xs text-text-dim leading-relaxed">
            Upload an image, place it on the 3D body, then run the analysis. The
            AI reads the style, complexity and color; the estimated price is
            calculated from your size, hourly rate and inventory costs, and
            updates automatically when you change them.
          </p>
        </div>
      )}

      {!isAnalyzing && result && (
        <Result
          result={result}
          isRecalculating={isRecalculating}
          staleReason={staleReason}
          recalcError={recalcError}
          missingMaterialNames={missingMaterialNames}
          price={props.price}
          onPriceChange={props.onPriceChange}
          priceError={props.priceError}
          onApply={props.onApply}
          applyTarget={props.applyTarget ?? "post"}
        />
      )}
    </div>
  );
}

function Result({
  result,
  isRecalculating,
  staleReason,
  recalcError,
  missingMaterialNames,
  price,
  onPriceChange,
  priceError,
  onApply,
  applyTarget,
}: {
  result: aiAnalysisResultInterface;
  isRecalculating: boolean;
  staleReason?: string;
  recalcError?: string;
  missingMaterialNames: string[];
  price: string;
  onPriceChange: (value: string) => void;
  priceError?: string;
  onApply: () => void;
  applyTarget: string;
}) {
  const { analysis, size, materials, pricing } = result;
  const dim = isRecalculating || !!staleReason;
  const atPrice = profitAtPrice(price, pricing);
  const suggestedRounded = Math.round(pricing.suggestedPrice);

  return (
    <div className="border-t border-border">
      {/* Estimated Price — the primary result */}
      <div className="px-5 py-5 bg-surface-alt">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Estimated Price
          </p>
          {isRecalculating && (
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-text-dim">
              <LoaderCircle className="w-3 h-3 animate-spin" /> Updating
            </span>
          )}
        </div>
        <div className="mt-2">
          <MoneyInput
            aria-label="Estimated price"
            placeholder={String(suggestedRounded)}
            value={price}
            onChange={onPriceChange}
            aria-invalid={!!priceError}
            className="h-12 text-2xl text-gold"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          />
          <FieldError>{priceError}</FieldError>
          <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-text-dim">
            <span>AI suggested {formatPeso(pricing.suggestedPrice)}</span>
            {atPrice.price !== suggestedRounded && (
              <button
                type="button"
                onClick={() => onPriceChange(String(suggestedRounded))}
                className="text-gold hover:underline"
              >
                Use suggested
              </button>
            )}
          </div>
        </div>
        <div
          className={`grid grid-cols-2 gap-3 mt-4 transition-opacity ${dim ? "opacity-60" : ""}`}
        >
          <MiniStat
            icon={Wallet}
            label="Estimated Cost"
            value={formatPeso(pricing.totalCost)}
          />
          <MiniStat
            key={atPrice.profit}
            icon={TrendingUp}
            label="Estimated Profit"
            value={formatPeso(atPrice.profit)}
            negative={atPrice.profit < 0}
          />
        </div>
        <p className="mt-2 text-[11px] text-text-dim" aria-live="polite">
          {atPrice.isSuggested
            ? "Profit at the AI suggested price — enter your price to update it."
            : `Profit = ${formatPeso(atPrice.price)} price − ${formatPeso(pricing.totalCost)} cost`}
        </p>
        {staleReason && (
          <p className="mt-3 text-[11px] text-text-dim">{staleReason}</p>
        )}
        {recalcError && (
          <p className="mt-3 text-[11px] text-danger-light" role="alert">
            {recalcError}
          </p>
        )}
      </div>

      <Section title="Tattoo Details">
        <div className="grid grid-cols-2 gap-4">
          <Stat icon={MapPin} label="Body Part" value={analysis.bodyPart} />
          <Stat
            icon={Ruler}
            label="Size"
            value={`${size.widthCm} × ${size.heightCm} cm`}
          />
          <Stat icon={Palette} label="Style" value={analysis.category} />
          <Stat
            icon={Flame}
            label="Complexity"
            value={`${analysis.complexity} / 5`}
          />
          <Stat
            icon={Palette}
            label="Color"
            value={analysis.isColored ? "Colored" : "Black & Gray"}
          />
          <Stat
            icon={Ruler}
            label="Area"
            value={`${size.areaCm2.toLocaleString()} cm²`}
          />
        </div>
      </Section>

      <Section title="Work Estimate">
        <div className="grid grid-cols-3 gap-4">
          <Stat
            icon={Timer}
            label="Hours"
            value={`${analysis.estimatedHours}`}
          />
          <Stat
            icon={CalendarDays}
            label="Sessions"
            value={`${analysis.estimatedSessions}`}
          />
          <Stat
            icon={Wallet}
            label="Rate"
            value={`${formatPeso(pricing.hourlyRate)}/h`}
          />
        </div>
      </Section>

      <Section title={`Materials · ${materials.length}`} icon={Package}>
        {materials.length === 0 ? (
          <p className="text-xs text-text-dim">
            No matching inventory items to recommend.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-text-dim">
                <th className="text-left font-normal pb-1.5">Item</th>
                <th className="text-right font-normal pb-1.5">Qty</th>
                <th className="text-right font-normal pb-1.5">Cost</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.inventoryItemId} className="border-t border-border">
                  <td className="py-1.5 text-text pr-2">{m.name}</td>
                  <td className="py-1.5 text-right text-text-muted whitespace-nowrap">
                    × {m.estimatedQuantity}
                  </td>
                  <td className="py-1.5 text-right text-text whitespace-nowrap">
                    {formatPeso(m.estimatedCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {missingMaterialNames.length > 0 && (
          <p
            className="flex items-start gap-1.5 text-[11px] text-danger-light mt-2"
            role="alert"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
            No longer in your inventory (excluded from cost):{" "}
            {missingMaterialNames.join(", ")}
          </p>
        )}
        <p className="text-[11px] text-text-dim mt-2">
          Recommendations only — nothing is deducted from inventory until the
          item is used.
        </p>
      </Section>

      <Section title="Pricing">
        <div className="space-y-1.5">
          <Row
            label="Estimated Labor Cost"
            value={formatPeso(pricing.laborCost)}
          />
          <Row
            label="Estimated Material Cost"
            value={formatPeso(pricing.materialCost)}
          />
          <Row
            label="Estimated Total Cost"
            value={formatPeso(pricing.totalCost)}
            emphasis
          />
          <Row
            label={`Complexity surcharge (${pricing.complexitySurchargePercent}%)`}
            value=""
            muted
          />
          <Row
            label={`Shop margin (${pricing.marginPercent}%)`}
            value=""
            muted
          />
          <Row
            label="AI Suggested Price"
            value={formatPeso(pricing.suggestedPrice)}
            emphasis
            gold
          />
          {!atPrice.isSuggested && (
            <Row
              label="Your Estimated Price"
              value={formatPeso(atPrice.price)}
              emphasis
            />
          )}
          <Row label="Estimated Profit" value={formatPeso(atPrice.profit)} />
        </div>
      </Section>

      <div className="p-5 border-t border-border space-y-3">
        <Button
          className="w-full"
          variant="outline"
          onClick={onApply}
          disabled={dim}
        >
          <Check className="w-4 h-4" /> Apply estimate to {applyTarget}
        </Button>
        <p className="text-[11px] text-text-dim leading-relaxed">
          Fills the suggested price, sessions and items used so you can review
          them. This is an AI-assisted estimate — the final price is always
          yours to set.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-t border-border space-y-3">
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon className="w-3.5 h-3.5 text-gold" />
        ) : (
          <div className="h-px w-4 bg-gold" />
        )}
        <span className="text-[10px] uppercase tracking-[0.22em] text-gold">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="flex items-center gap-1.5 text-text-dim">
        <Icon className="w-3.5 h-3.5 text-gold shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.14em] truncate">
          {label}
        </span>
      </div>
      <p className="text-sm text-text truncate">{value}</p>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  negative,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-1.5 text-text-dim">
        <Icon className="w-3.5 h-3.5 text-gold" />
        <span className="text-[10px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p
        className={`text-base mt-0.5 price-pop ${negative ? "text-danger-light" : "text-text"}`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
  gold,
  muted,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  gold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={
          muted ? "text-[11px] text-text-dim" : "text-xs text-text-muted"
        }
      >
        {label}
      </span>
      <span
        className={
          gold
            ? "text-sm text-gold font-medium"
            : emphasis
              ? "text-sm text-text font-medium"
              : "text-xs text-text"
        }
      >
        {value}
      </span>
    </div>
  );
}
