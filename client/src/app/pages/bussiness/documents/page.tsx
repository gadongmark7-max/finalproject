"use client"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { documentInterface } from "@/app/types/document.type";
import useUserStore from "@/app/store/useUserStore";
import LoadingScreen from "@/components/ui/loadingScreen";
import { SubmitDocs } from "./components/submitDocs";
import {
  FileText,
  Building2,
  ShieldCheck,
  Landmark,
  HeartPulse,
  Droplets,
  Briefcase,
  Scale,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  BadgeCheck,
} from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentField = {
  key: keyof Omit<documentInterface, "_id">;
  label: string;
  icon: React.ElementType;
  hasExpiration: boolean;
};

// ─── Document definitions ─────────────────────────────────────────────────────

const DOCUMENT_FIELDS: DocumentField[] = [
  { key: "bussinessPermit",   label: "Business Permit",    icon: Briefcase,   hasExpiration: true  },
  { key: "BarangayClearance", label: "Barangay Clearance", icon: ShieldCheck, hasExpiration: true  },
  { key: "MayorPermit",       label: "Mayor's Permit",     icon: Building2,   hasExpiration: true  },
  { key: "sanitaryPermit",    label: "Sanitary Permit",    icon: Droplets,    hasExpiration: true  },
  { key: "HealthPermit",      label: "Health Permit",      icon: HeartPulse,  hasExpiration: true  },
  { key: "BIRRegistarion",    label: "BIR Registration",   icon: Landmark,    hasExpiration: false },
  { key: "DTIRegistarion",    label: "DTI Registration",   icon: Scale,       hasExpiration: false },
  { key: "SECRegistarion",    label: "SEC Registration",   icon: FileText,    hasExpiration: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpiringSoon(expiration?: string): boolean {
  if (!expiration) return false;
  const diff = new Date(expiration).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function isExpired(expiration?: string): boolean {
  if (!expiration) return false;
  return new Date(expiration).getTime() < Date.now();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Document Card ────────────────────────────────────────────────────────────

type DocEntry = { url?: string; expiration?: string } | null | undefined;

interface DocumentCardProps {
  docId: string;
  field: DocumentField;
  entry: DocEntry;
  refetch: () => void;
}

function DocumentCard({ docId, field, entry, refetch }: DocumentCardProps) {
  const { key, label, icon: Icon, hasExpiration } = field;
  const [imgError, setImgError] = useState(false);

  const uploaded = !!entry?.url;
  const expiring = hasExpiration && isExpiringSoon(entry?.expiration);
  const expired  = hasExpiration && isExpired(entry?.expiration);

  const statusLabel = expired ? "Expired" : expiring ? "Expiring Soon" : uploaded ? "Uploaded" : "Not Uploaded";
  const StatusIcon  = !uploaded || expired ? AlertCircle : expiring ? Clock : CheckCircle2;

  const statusColor = expired
    ? "text-danger-light border-danger-border bg-danger-muted"
    : expiring
    ? "text-warning-light border-warning-border bg-warning-muted"
    : uploaded
    ? "text-success-light border-success-border bg-success-muted"
    : "text-text-dim border-border bg-surface-alt";

  const accentColor = expired
    ? "bg-danger"
    : expiring
    ? "bg-warning"
    : uploaded
    ? "bg-gold"
    : "bg-border";

  return (
    <div className="group relative flex flex-col bg-surface border border-border hover:border-border-gold transition-all duration-500 overflow-hidden">

      {/* Gold bottom reveal */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700 z-10" />

      {/* Top accent bar */}
      <div className={`h-[2px] w-full ${accentColor} transition-all duration-300`} />

      <div className="flex flex-col gap-4 p-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 bg-surface-alt border border-border`}>
            <Icon size={16} className="text-gold" />
          </div>
          <div>
            <h3
              className="font-light text-text text-sm leading-tight tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {label}
            </h3>
            <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${statusColor}`}>
              <StatusIcon size={10} />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Image preview */}
        {uploaded && !imgError ? (
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-alt border border-border">
            <img
              src={entry!.url}
              alt={label}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale opacity-80"
            />
            <a
              href={entry!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-primary/0 hover:bg-primary/60 transition-colors duration-300"
            >
              <span className="opacity-0 group-hover:opacity-100 text-gold text-[10px] uppercase tracking-[0.2em] border border-gold px-3 py-1.5 transition-opacity duration-300 bg-primary/80">
                View Full
              </span>
            </a>
          </div>
        ) : uploaded && imgError ? (
          <div className="w-full aspect-[4/3] bg-surface-alt border border-border flex flex-col items-center justify-center gap-2 text-text-dim">
            <FileText size={24} className="text-text-dim" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">Preview unavailable</span>
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-surface-alt border border-dashed border-border flex flex-col items-center justify-center gap-2">
            <Upload size={20} className="text-text-dim" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-dim">No document yet</span>
          </div>
        )}

        {/* Expiration info */}
        {hasExpiration && (
          <div className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] px-3 py-2 border ${
            expired
              ? "border-danger-border bg-danger-muted text-danger-light"
              : expiring
              ? "border-warning-border bg-warning-muted text-warning-light"
              : "border-border bg-surface-alt text-text-muted"
          }`}>
            <Clock size={11} />
            <span>
              {entry?.expiration
                ? `${expired ? "Expired" : "Expires"}: ${formatDate(entry.expiration)}`
                : "No expiration date set"}
            </span>
          </div>
        )}

        {!hasExpiration && uploaded && (
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] px-3 py-2 border border-border bg-surface-alt text-text-muted">
            <CheckCircle2 size={11} className="text-gold" />
            <span>No expiration required</span>
          </div>
        )}

        {/* Upload action */}
        <SubmitDocs
          id={docId}
          document={key as string}
          hasExpiration={hasExpiration}
          refetch={refetch}
        />
      </div>
    </div>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────

interface StatBoxProps {
  value: number;
  label: string;
  accent?: boolean;
}

function StatBox({ value, label, accent }: StatBoxProps) {
  return (
    <div className={`group relative flex flex-col items-center justify-center border p-5 gap-1 overflow-hidden transition-all duration-500 ${accent ? "bg-secondary border-border-gold" : "bg-surface border-border hover:border-border-gold"}`}>
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
      <span
        className="text-4xl font-light text-text tracking-[-0.02em]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{label}</span>
    </div>
  );
}

// ─── Summary Bar ─────────────────────────────────────────────────────────────

function SummaryBar({ documents }: { documents: documentInterface }) {
  const total    = DOCUMENT_FIELDS.length;
  const uploaded = DOCUMENT_FIELDS.filter((f) => !!(documents as any)[f.key]).length;
  const expired  = DOCUMENT_FIELDS.filter((f) => {
    const e = (documents as any)[f.key];
    return f.hasExpiration && e && isExpired(e.expiration);
  }).length;
  const expiring = DOCUMENT_FIELDS.filter((f) => {
    const e = (documents as any)[f.key];
    return f.hasExpiration && e && isExpiringSoon(e.expiration);
  }).length;
  const missing    = total - uploaded;
  const pct        = Math.round((uploaded / total) * 100);
  const isComplete = uploaded === total && expired === 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
        <StatBox value={uploaded} label="Uploaded"      accent />
        <StatBox value={expiring} label="Expiring Soon"        />
        <StatBox value={expired}  label="Expired"              />
        <StatBox value={missing}  label="Missing"              />
      </div>

      {/* Progress + Verified */}
      <div className="bg-secondary border border-border p-6 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />

        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Document Completion</span>
            <span
              className="text-lg font-light text-gold"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {uploaded}/{total}
            </span>
          </div>
          <div className="w-full h-[2px] bg-border overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim mt-2">{pct}% complete</p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-border" />

        {/* Verified badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className={`relative w-14 h-14 overflow-hidden border transition-all duration-500 ${isComplete ? "" : " opacity-30"}`}>
            <img
              src="/verifiedIcon.jpg"
              alt="Verified Badge"
              className="w-full h-full object-cover "
            />
          </div>
          <div className="max-w-[220px]">
            <div className="flex items-center gap-2 mb-1">
              <BadgeCheck size={14} className={isComplete ? "text-gold" : "text-text-dim"} />
              <p className={`text-sm font-light tracking-wide ${isComplete ? "text-gold" : "text-text-dim"}`}
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {isComplete ? "Account Verified" : "Get Verified"}
              </p>
            </div>
            <p className="text-[11px] text-text-muted leading-snug">
              Complete all documents to get your account marked as{" "}
              <span className="text-gold">Verified</span>. Clients see this badge on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { user } = useUserStore();

  const { data: documents, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<documentInterface> => {
      const response = await axiosInstance.get(`/account/document/${user?._id}`);
      return response.data;
    },
  });

  if (!documents) return <LoadingScreen />;

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

        {/* Page Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Compliance</span>
          </div>
          <h1
            className="text-4xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Business Documents
          </h1>
          <p className="text-sm text-text-muted leading-relaxed mt-2">
            Manage and upload your required business compliance documents.
          </p>
        </div>

        {/* Summary + Stats */}
        <SummaryBar documents={documents} />

        {/* Document grid */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-4 bg-gold opacity-60" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Document Registry</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
            {DOCUMENT_FIELDS.map((field) => (
              <DocumentCard
                key={field.key}
                docId={documents._id}
                field={field}
                entry={(documents as any)[field.key]}
                refetch={refetch}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">
            {DOCUMENT_FIELDS.length} documents required · {DOCUMENT_FIELDS.filter(f => !!(documents as any)[f.key]).length} uploaded
          </p>
          <div className="h-px w-24 bg-border" />
        </div>

      </div>
    </div>
  );
}