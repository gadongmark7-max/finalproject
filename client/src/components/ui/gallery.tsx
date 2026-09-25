"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryFile {
  _id?: string;
  fileUrl: string;
  fileType: string;
  type: string;
}

export const GALLERY_CAROUSEL_THRESHOLD = 5;

const DEFAULT_GRID = "grid-cols-2 sm:grid-cols-3";

function Media({
  file,
  className,
  preview = false,
}: {
  file: GalleryFile;
  className?: string;
  preview?: boolean;
}) {
  if (file.fileType === "video") {
    return (
      <video
        src={file.fileUrl}
        className={className}
        {...(preview
          ? { controls: true, autoPlay: true }
          : { autoPlay: true, loop: true, muted: true })}
        playsInline
      />
    );
  }
  return <img src={file.fileUrl} alt="" className={className} />;
}


export function Gallery({
  files,
  layout = "auto",
  gridClassName = DEFAULT_GRID,
  extraItem,
  onDelete,
}: {
  files: GalleryFile[];
  layout?: "auto" | "grid";
  gridClassName?: string;
  extraItem?: ReactNode;
  onDelete?: (file: GalleryFile) => Promise<unknown>;
}) {
  const [selected, setSelected] = useState<GalleryFile | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const closePreview = () => {
    setSelected(null);
    setConfirming(false);
  };

  const handleDelete = async () => {
    if (!selected || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(selected);
      closePreview();
    } catch {
      setConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const tile = (file: GalleryFile, index: number) => (
    <button
      key={file._id ?? `${file.fileUrl}-${index}`}
      type="button"
      onClick={() => setSelected(file)}
      className="group relative block w-full aspect-[4/5] overflow-hidden rounded shadow border border-border cursor-zoom-in focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
    >
      <Media
        file={file}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </button>
  );

  const extra = extraItem ? (
    <div className="w-full aspect-[4/5] [&>*]:!w-full [&>*]:!min-w-0 [&>*]:!h-full">
      {extraItem}
    </div>
  ) : null;

  let content: ReactNode;

  if (files.length === 0) {
    content = (
      <div className={cn("grid gap-3", gridClassName)}>
        <div className="w-full aspect-[4/5] rounded shadow border flex justify-center items-center text-text-muted text-sm">
          No images
        </div>
        {extra}
      </div>
    );
  } else if (layout === "auto" && files.length >= GALLERY_CAROUSEL_THRESHOLD) {
    content = (
      <Carousel opts={{ align: "start" }} className="w-full px-1">
        <CarouselContent className="-ml-3">
          {files.map((file, index) => (
            <CarouselItem
              key={file._id ?? `${file.fileUrl}-${index}`}
              className="pl-3 basis-1/2 sm:basis-1/3"
            >
              {tile(file, index)}
            </CarouselItem>
          ))}
          {extra && (
            <CarouselItem className="pl-3 basis-1/2 sm:basis-1/3">
              {extra}
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-primary/80" />
        <CarouselNext className="right-2 bg-primary/80" />
      </Carousel>
    );
  } else {
    content = (
      <div className={cn("grid gap-3", gridClassName)}>
        {files.map(tile)}
        {extra}
      </div>
    );
  }

  return (
    <>
      {content}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !isDeleting) closePreview();
        }}
      >
        <DialogContent className="sm:max-w-3xl p-4 gap-3">
          <DialogTitle className="sr-only">Gallery preview</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged view of the selected gallery item
          </DialogDescription>

          {selected && (
            <div className="flex items-center justify-center">
              <Media
                file={selected}
                preview
                className="max-w-full max-h-[70dvh] w-auto h-auto object-contain"
              />
            </div>
          )}

          {onDelete && selected && (
            <div className="flex items-center justify-end gap-2">
              {confirming ? (
                <>
                  <span className="mr-auto text-xs text-text-muted">
                    Delete this permanently?
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDeleting}
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirming(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
