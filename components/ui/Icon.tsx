import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  /** Size shorthand (applied to both width and height). Default 16. */
  size?: number;
}

/** Thin wrapper around an inline SVG slot for consistent icon sizing. */
export function Icon({ size = 16, className = "", children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
}
