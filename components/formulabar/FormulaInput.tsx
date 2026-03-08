interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onFocus?: () => void;
}

export function FormulaInput({ value, onChange, onCommit, onCancel, onFocus }: FormulaInputProps) {
  return (
    <input
      data-cell-editor="true"
      className="flex-1 px-2 text-sm text-gray-900 outline-none font-mono bg-transparent"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit(value);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={() => onCommit(value)}
      spellCheck={false}
      autoComplete="off"
    />
  );
}
