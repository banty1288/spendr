export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  let effectiveLocale = locale;
  if (effectiveLocale === "hi") effectiveLocale = "hi-IN";
  if (effectiveLocale === "en") effectiveLocale = "en-US";
  if (currency === "INR") effectiveLocale = "en-IN"; // Enforce Indian numbering for INR
  
  return new Intl.NumberFormat(effectiveLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
