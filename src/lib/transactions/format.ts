import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatTransactionDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return format(new Date(y, m - 1, 1), "MMMM yyyy");
}
