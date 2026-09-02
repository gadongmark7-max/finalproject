import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface FullScreenModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}

export function FullScreenModal({
  open,
  children,
}: FullScreenModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[10000] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold z-[10000]" />

      <div className="absolute inset-0 bg-primary flex flex-col">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

    </div>,
    document.body
  );
}