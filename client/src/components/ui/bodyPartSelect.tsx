import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Body Parts
export const bodyParts = [
  "Arm",      // 1.2
  "Calves",  // 1.2
  "Stomach", // 1.3
  "Legs",    // 1.3
  "Hand",    // 1.4
  "Chest",   // 1.5
  "Back",    // 1.6
  "Head",    // 2.0
] as const;


export type BodyPart = (typeof bodyParts)[number];

interface BodyPartSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const BodyPartSelect: React.FC<BodyPartSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as BodyPart)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select body part" />
      </SelectTrigger>
      <SelectContent>
        {bodyParts.map((part) => (
          <SelectItem key={part} value={part}>
            {part}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};