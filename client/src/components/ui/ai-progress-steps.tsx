"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Sparkles } from "lucide-react";

const STEP_INTERVAL_MS = 650;

interface AiProgressStepsProps {
  title: string;
  steps: string[];
}

export function AiProgressSteps({ title, steps }: AiProgressStepsProps) {
  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    setRevealed(1);
    const interval = setInterval(() => {
      setRevealed((prev) => (prev >= steps.length ? prev : prev + 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      className="relative border border-gold-dim bg-surface p-5 overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold opacity-40" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold opacity-40" />

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
          {title}
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, index) => {
          const done = index < revealed - 1;
          const active = index === revealed - 1;
          const pending = index >= revealed;

          return (
            <div
              key={step}
              className="flex items-center gap-2.5 transition-opacity duration-300"
              style={{ opacity: pending ? 0.35 : 1 }}
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {done ? (
                  <Check className="w-3.5 h-3.5 text-gold" />
                ) : active ? (
                  <LoaderCircle className="w-3.5 h-3.5 text-gold animate-spin" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-text-dim" />
                )}
              </div>
              <span className="text-xs text-text-muted">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
