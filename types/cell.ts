export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type FontWeight = "normal" | "bold";
export type FontStyle = "normal" | "italic";

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  horizontalAlign?: HorizontalAlign;
  verticalAlign?: VerticalAlign;
  wrapText?: boolean;
  numberFormat?: string;
}

export interface CellData {
  /** Raw value or formula string (e.g. "=SUM(A1:A5)" or "42") */
  raw: string;
  /** Computed/display value after formula evaluation */
  computed?: string;
  style?: CellStyle;
}

export type CellMap = Record<string, CellData>; // key: "A1", "B3", ...

/** Wire format returned by the backend */
export interface ApiCell {
  id: string;
  sheetId: string;
  row: number;
  col: number;
  value?: string;
  formula?: string;
  style?: CellStyle;
}
