import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
            ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-300"}
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
