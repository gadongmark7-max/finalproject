"use client"
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { documentInterface } from "@/app/types/document.type";
import { checkIfPermitIsExpired, checkIfPermitIsNear, getRemainingDays } from "@/app/utils/documentWarningFunctions";
import useUserStore from "@/app/store/useUserStore";
import { AlertTriangle, XCircle, Bell, X } from "lucide-react";

// ─── Document fields with expiration ─────────────────────────────────────────

const EXPIRABLE_FIELDS: { key: keyof documentInterface; label: string }[] = [
  { key: "bussinessPermit",   label: "Business Permit"    },
  { key: "BarangayClearance", label: "Barangay Clearance" },
  { key: "MayorPermit",       label: "Mayor's Permit"     },
  { key: "sanitaryPermit",    label: "Sanitary Permit"    },
  { key: "HealthPermit",      label: "Health Permit"      },
];

type WarningItem = {
  document: string;
  label: string;
  expiration: string;
  remainingDays: number;
  type: "warning" | "danger";
};

// ─── Single Warning Card ──────────────────────────────────────────────────────

function WarningCard({
  item,
  index,
  total,
  isExpanded,
  onClose,
}: {
  item: WarningItem;
  index: number;
  total: number;
  isExpanded: boolean;
  onClose: () => void;
}) {
  const isDanger = item.type === "danger";

  const stackOffset  = index * 10;
  const expandOffset = index * 88;

  return (
    <div
      className="absolute left-1/2 w-80 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        top: isExpanded ? expandOffset : stackOffset,
        transform: !isExpanded && index > 0
          ? `translateX(-50%) scale(${1 - index * 0.025})`
          : "translateX(-50%) scale(1)",
        zIndex: total - index,
        opacity: !isExpanded && index > 2 ? 0 : 1,
        pointerEvents: !isExpanded && index > 0 ? "none" : "auto",
      }}
    >
      <div
        className={`
          border overflow-hidden rounded-none
          ${isDanger
            ? "bg-danger-muted border-danger-border"
            : "bg-warning-muted border-warning-border"
          }
        `}
      >
        {/* Top stripe */}
        <div className={`h-px w-full ${isDanger ? "bg-danger" : "bg-warning"}`} />

        <div className="flex gap-3 p-4">
          {/* Icon */}
          <div
            className={`shrink-0 w-8 h-8 flex items-center justify-center border ${
              isDanger
                ? "bg-danger-muted border-danger-border"
                : "bg-warning-muted border-warning-border"
            }`}
          >
            {isDanger
              ? <XCircle className="w-4 h-4 text-danger-light" />
              : <AlertTriangle className="w-4 h-4 text-warning-light" />
            }
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4
                className={`text-sm font-light leading-tight truncate tracking-wide ${
                  isDanger ? "text-danger-light" : "text-warning-light"
                }`}
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {item.label}
              </h4>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`
                    text-[9px] font-light uppercase tracking-[0.2em] px-2 py-0.5 border
                    ${isDanger
                      ? "border-danger-border text-danger-light bg-danger-muted"
                      : "border-warning-border text-warning-light bg-warning-muted"
                    }
                  `}
                >
                  {isDanger ? "Expired" : `${item.remainingDays}d left`}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className={`
                    w-5 h-5 flex items-center justify-center border transition-all duration-200
                    ${isDanger
                      ? "border-danger-border text-danger-light hover:bg-danger-muted"
                      : "border-warning-border text-warning-light hover:bg-warning-muted"
                    }
                  `}
                  aria-label="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p
              className={`text-xs mt-1 leading-snug ${
                isDanger ? "text-danger-light/70" : "text-warning-light/70"
              }`}
            >
              {isDanger
                ? "This permit has expired. Renew immediately to avoid penalties."
                : `Expires on ${new Date(item.expiration).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}. Please renew soon.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentWarnings() {
  const { user } = useUserStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const dismiss = (key: string) => setDismissed((prev) => new Set(prev).add(key));
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: documents } = useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<documentInterface> => {
      const response = await axiosInstance.get(`/account/document/${user?._id}`);
      return response.data;
    },
    enabled: mounted && !!user?._id,
  });

  if (!mounted || !documents) return null;

  const allWarnings: WarningItem[] = [];

  for (const { key, label } of EXPIRABLE_FIELDS) {
    const entry = (documents as any)[key];
    if (!entry?.expiration) continue;

    if (checkIfPermitIsExpired(entry.expiration)) {
      allWarnings.push({
        document: key,
        label,
        expiration: entry.expiration,
        remainingDays: 0,
        type: "danger",
      });
    } else if (checkIfPermitIsNear(entry.expiration)) {
      allWarnings.push({
        document: key,
        label,
        expiration: entry.expiration,
        remainingDays: getRemainingDays(entry.expiration),
        type: "warning",
      });
    }
  }

  const warnings = allWarnings.filter((w) => !dismissed.has(`${w.document}-${w.type}`));

  if (warnings.length === 0) return null;

  const collapsedHeight = 72 + Math.min(warnings.length - 1, 2) * 10;
  const expandedHeight  = warnings.length * 88 + 4;

  return (
    <div
      className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className="relative pointer-events-auto"
        style={{
          width: "320px",
          height: isExpanded ? expandedHeight : collapsedHeight,
          transition: "height 500ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Cards rendered back-to-front so first is on top */}
        {[...warnings].reverse().map((item, i) => {
          const originalIndex = warnings.length - 1 - i;
          return (
            <WarningCard
              key={`${item.document}-${item.type}`}
              item={item}
              index={originalIndex}
              total={warnings.length}
              isExpanded={isExpanded}
              onClose={() => dismiss(`${item.document}-${item.type}`)}
            />
          );
        })}

        {/* Count badge */}
        {!isExpanded && warnings.length > 1 && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-1.5 bg-surface border border-border-gold text-gold text-[9px] uppercase tracking-[0.2em] font-light px-2.5 py-1">
              <Bell className="w-3 h-3" />
              {warnings.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}