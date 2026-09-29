"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { downloadImage } from "@/app/utils/downloadImage";
import { errorAlert } from "@/app/utils/alert";
import { cn } from "@/lib/utils";

export function ChatImage({
  src,
  alt = "sent",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadImage(src, "chat-image");
    } catch (e) {
      errorAlert(
        e instanceof Error && e.message
          ? e.message
          : "Could not download this image. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative group">
      <img
        src={src}
        alt={alt}
        className={cn("max-h-64 object-cover border border-border", className)}
      />
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        aria-label="Download image"
        title="Download image"
        className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 bg-primary/85 text-gold border border-border-gold px-2.5 py-1.5 text-[10px] uppercase tracking-[0.15em] backdrop-blur-sm transition-colors hover:bg-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold disabled:opacity-70"
      >
        {downloading ? (
          <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">
          {downloading ? "Saving…" : "Download"}
        </span>
      </button>
    </div>
  );
}
