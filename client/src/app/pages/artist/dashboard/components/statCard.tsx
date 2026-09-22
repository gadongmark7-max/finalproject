import { LucideIcon } from "lucide-react";

export const StatCard = ({
  title,
  value,
  hasPhp,
  icon: Icon,
  tone = "gold",
}: {
  title: string;
  value: number;
  hasPhp?: boolean;
  icon: LucideIcon;
  tone?: "gold" | "success" | "danger" | "warning";
}) => {
  const toneClasses: Record<string, string> = {
    gold: "text-gold border-border",
    success: "text-success-light border-border",
    danger: "text-danger-light border-border",
    warning: "text-warning-light border-border",
  };

  return (
    <div className="group relative w-full h-full bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden p-6 flex flex-col justify-between">
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
      <div className="absolute top-0 left-0 w-[2px] h-0 bg-gold group-hover:h-full transition-all duration-500" />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted leading-relaxed">
            {title}
          </p>
        </div>
        <div className={`bg-surface-alt border p-1.5 ${toneClasses[tone]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-4">
        <p
          className="text-3xl font-light text-text tracking-[-0.02em] tabular-nums"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {hasPhp && <span className="text-gold mr-1">₱</span>}
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
