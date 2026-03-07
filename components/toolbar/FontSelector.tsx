"use client";

import { FONT_FAMILIES } from "@/constants/defaults";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

interface FontSelectorProps {
  value?: string;
  onChange: (font: string) => void;
}

/** Font family selector dropdown for the toolbar. */
export function FontSelector({ value = "Arial", onChange }: FontSelectorProps) {
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-1 h-7 px-2 rounded text-xs border border-gray-200 hover:bg-gray-50 min-w-[110px] justify-between">
          <span className="truncate">{value}</span>
          <svg className="size-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      }
    >
      {FONT_FAMILIES.map((font) => (
        <DropdownItem
          key={font}
          active={font === value}
          onClick={() => onChange(font)}
        >
          <span style={{ fontFamily: font }}>{font}</span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
