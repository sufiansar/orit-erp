import { format, parseISO, isValid } from "date-fns";

export function formatDate(
  dateInput: string | Date | null | undefined,
  pattern = "MMM dd, yyyy"
): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return "—";
    return format(d, pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(
  dateInput: string | Date | null | undefined
): string {
  return formatDate(dateInput, "MMM dd, yyyy · HH:mm");
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatNumber(value: number, locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return value.toString();
  }
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
