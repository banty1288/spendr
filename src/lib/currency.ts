export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  locale: string = "en-US"
) {
  // Map "hinglish" back to en-IN for native formatting
  const effectiveLocale = locale === "hinglish" ? "en-IN" : locale;
  
  return new Intl.NumberFormat(effectiveLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
