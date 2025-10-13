
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const colors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 rounded-full border"
              style={{ backgroundColor: value }}
            />
            {value ? <span>{value}</span> : <span>Select a color</span>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-[--radix-popover-trigger-width]">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <Button
              key={color}
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            >
              {value === color && <Check className="h-4 w-4 text-white" />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
