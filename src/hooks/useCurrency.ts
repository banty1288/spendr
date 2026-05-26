export function useCurrency() {
  const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const convertAndFormat = (amount: number) => formatAmount(amount);

  return {
    currency: "INR",
    symbol: "₹",
    isLoading: false,
    formatAmount,
    convertAndFormat,
  };
}
