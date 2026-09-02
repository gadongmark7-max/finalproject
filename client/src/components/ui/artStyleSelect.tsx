import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1️⃣ Art Styles
export const tattooArtStyles = [
  "Minimalist",   // 1.0
  "Fine Line",    // 1.1
  "Tribal",       // 1.1
  "Blackwork",    // 1.2
  "Illustrative", // 1.2
  "Anime",        // 1.3
  "Dotwork",      // 1.4
  "Geometric",    // 1.4
  "Japanese",    // 1.5
  "Realism",     // 1.8
  "Portrait",    // 1.9
] as const;


export type ArtStyle = (typeof tattooArtStyles)[number];

interface ArtStyleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const ArtStyleSelect: React.FC<ArtStyleSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as ArtStyle)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder=" art style" />
      </SelectTrigger>
      <SelectContent>
        {tattooArtStyles.map((style) => (
          <SelectItem key={style} value={style}>
            {style}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
