/** Number format identifiers used in format selectors and cell formatting. */
export type NumberFormatId =
  | "auto"
  | "plain"
  | "number"
  | "percent"
  | "currency_usd"
  | "currency_eur"
  | "currency_gbp"
  | "currency_inr"
  | "date_short"
  | "date_long"
  | "date_iso"
  | "time"
  | "datetime"
  | "scientific"
  | "accounting";

export interface NumberFormat {
  id: NumberFormatId;
  label: string;
  /** Pattern description for the toolbar tooltip. */
  example: string;
}

/** All available number formats. */
export const NUMBER_FORMATS: NumberFormat[] = [
  { id: "auto", label: "Automatic", example: "1000.12" },
  { id: "plain", label: "Plain text", example: "1000.12" },
  { id: "number", label: "Number", example: "1,000.12" },
  { id: "percent", label: "Percent", example: "10.12%" },
  { id: "currency_usd", label: "Currency (USD)", example: "$1,000.12" },
  { id: "currency_eur", label: "Currency (EUR)", example: "\u20AC1,000.12" },
  { id: "currency_gbp", label: "Currency (GBP)", example: "\u00A31,000.12" },
  { id: "currency_inr", label: "Currency (INR)", example: "\u20B91,000.12" },
  { id: "date_short", label: "Date", example: "12/31/2024" },
  { id: "date_long", label: "Date (long)", example: "December 31, 2024" },
  { id: "date_iso", label: "Date (ISO)", example: "2024-12-31" },
  { id: "time", label: "Time", example: "3:15 PM" },
  { id: "datetime", label: "Date time", example: "12/31/2024 3:15 PM" },
  { id: "scientific", label: "Scientific", example: "1.00E+03" },
  { id: "accounting", label: "Accounting", example: "$ 1,000.12" },
] as const;

/** Locale used for Intl formatters. */
export const DEFAULT_LOCALE = "en-US";
