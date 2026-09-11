"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}