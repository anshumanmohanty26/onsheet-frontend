"use client";

import { FONT_SIZES } from "@/constants/defaults";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

interface FontSizeSelectorProps {
  value?: number;
  onChange: (size: number) => void;
}

/** Font size selector dropdown for the toolbar. */
export function FontSizeSelector({ value = 13, onChange }: FontSizeSelectorProps) {
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-1 h-7 px-2 rounded text-xs border border-gray-200 hover:bg-gray-50 min-w-[50px] justify-between">
          <span>{value}</span>
          <svg className="size-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      }
    >
      {FONT_SIZES.map((size) => (
        <DropdownItem
          key={size}
          active={size === value}
          onClick={() => onChange(size)}
        >
          {size}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
