"use client";

import { NUMBER_FORMATS, type NumberFormatId } from "@/constants/formats";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

interface NumberFormatSelectorProps {
  value?: string;
  onChange: (format: NumberFormatId) => void;
}

/** Number format selector (auto, currency, percent, date, etc.). */
export function NumberFormatSelector({ value = "auto", onChange }: NumberFormatSelectorProps) {
  const current = NUMBER_FORMATS.find((f) => f.id === value) ?? NUMBER_FORMATS[0];

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-1 h-7 px-2 rounded text-xs border border-gray-200 hover:bg-gray-50 min-w-[90px] justify-between">
          <span className="truncate">{current.label}</span>
          <svg className="size-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      }
    >
      {NUMBER_FORMATS.map((fmt) => (
        <DropdownItem
          key={fmt.id}
          active={fmt.id === value}
          onClick={() => onChange(fmt.id)}
        >
          <div className="flex justify-between w-full gap-3">
            <span>{fmt.label}</span>
            <span className="text-gray-400">{fmt.example}</span>
          </div>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
