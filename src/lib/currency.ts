export function formatCurrency(
  amount: number,
  currencyCode: string = "INR",
  locale: string = "en-IN"
) {
  // Map "hinglish" back to en-IN for native formatting
  const effectiveLocale = locale === "hinglish" ? "en-IN" : locale;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Custom Lakh and Crore formatting for INR
  if (currencyCode === "INR" && absAmount >= 100000) {
    let formatted = "";
    if (absAmount >= 10000000) {
      formatted = `₹${(absAmount / 10000000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")}Cr`;
    } else {
      formatted = `₹${(absAmount / 100000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")}L`;
    }
    return isNegative ? `-${formatted}` : formatted;
  }

  return new Intl.NumberFormat(effectiveLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
