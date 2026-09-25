"use client";
import Link from "next/link";
import { Gallery, type GalleryFile } from "@/components/ui/gallery";

export default function ImgCard({
  files,
  viewAllHref,
}: {
  files: GalleryFile[];
  viewAllHref?: string;
}) {
  return (
    <div className="space-y-3">
      <Gallery files={files} />
      {viewAllHref && files.length > 0 && (
        <div className="flex justify-end">
          <Link
            href={viewAllHref}
            className="text-[10px] uppercase tracking-[0.2em] text-gold border-b border-gold/30 pb-px hover:border-gold transition-colors duration-200"
          >
            View All ({files.length})
          </Link>
        </div>
      )}
    </div>
  );
}
