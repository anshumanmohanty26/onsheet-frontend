interface CellReferenceProps {
  value: string;
}

export function CellReference({ value }: CellReferenceProps) {
  return (
    <div className="flex items-center justify-center w-20 border-r border-gray-200 text-xs font-mono text-gray-700 bg-gray-50 px-2 shrink-0">
      {value || ""}
    </div>
  );
}
