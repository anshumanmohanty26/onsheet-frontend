"use client";

import { isDark } from "@/lib/utils/color";

interface ColorPickerProps {
  colors: readonly string[];
  value?: string;
  onChange: (color: string) => void;
}

/** Grid-based color picker for cell/text formatting. */
export function ColorPicker({ colors, value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-1 p-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`size-6 rounded border transition-transform hover:scale-110 ${
            value === color ? "ring-2 ring-emerald-500 ring-offset-1" : "border-gray-200"
          }`}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Color ${color}`}
        >
          {value === color && (
            <svg
              className="size-3 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark(color) ? "#fff" : "#000"}
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
