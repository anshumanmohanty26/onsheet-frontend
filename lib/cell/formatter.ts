import type { NumberFormatId } from "@/constants/formats";
import { DEFAULT_LOCALE } from "@/constants/formats";

/** Format a numeric value according to the given NumberFormatId. */
export function formatCellValue(value: string | number, format: NumberFormatId = "auto"): string {
  const num = typeof value === "number" ? value : Number(value);

  // If not a valid number, return as-is
  if (typeof value === "string" && Number.isNaN(num)) return value;

  switch (format) {
    case "auto":
    case "plain":
      return String(value);

    case "number":
      return new Intl.NumberFormat(DEFAULT_LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);

    case "percent":
      return new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: "percent",
        minimumFractionDigits: 2,
      }).format(num);

    case "currency_usd":
      return new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "USD" }).format(
        num,
      );

    case "currency_eur":
      return new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "EUR" }).format(
        num,
      );

    case "currency_gbp":
      return new Intl.NumberFormat(DEFAULT_LOCALE, { style: "currency", currency: "GBP" }).format(
        num,
      );

    case "currency_inr":
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);

    case "scientific":
      return num.toExponential(2).toUpperCase();

    case "accounting": {
      const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: "currency",
        currency: "USD",
        currencySign: "accounting",
      }).format(num);
      return formatted;
    }

    case "date_short":
    case "date_long":
    case "date_iso":
    case "time":
    case "datetime": {
      const d = new Date(num);
      if (Number.isNaN(d.getTime())) return String(value);
      return formatDate(d, format);
    }

    default:
      return String(value);
  }
}

function formatDate(d: Date, format: string): string {
  switch (format) {
    case "date_short":
      return d.toLocaleDateString(DEFAULT_LOCALE);
    case "date_long":
      return d.toLocaleDateString(DEFAULT_LOCALE, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "date_iso":
      return d.toISOString().slice(0, 10);
    case "time":
      return d.toLocaleTimeString(DEFAULT_LOCALE, { hour: "numeric", minute: "2-digit" });
    case "datetime":
      return `${d.toLocaleDateString(DEFAULT_LOCALE)} ${d.toLocaleTimeString(DEFAULT_LOCALE, { hour: "numeric", minute: "2-digit" })}`;
    default:
      return d.toLocaleDateString(DEFAULT_LOCALE);
  }
}
