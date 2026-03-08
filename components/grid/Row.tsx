"use client";

import { type ReactNode, memo } from "react";

interface RowProps {
  height: number;
  children: ReactNode;
}

/** Grid row wrapper that sets consistent row height. */
export const Row = memo(function Row({ height, children }: RowProps) {
  return <tr style={{ height }}>{children}</tr>;
});
