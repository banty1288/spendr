import { useUserData } from "./useUserData";
import { formatCurrency } from "../lib/currency";

export function useCurrency() {
  const { data: userData } = useUserData();
  // Force INR regardless of user settings to fix dollar issue
  const activeCurrency = "INR";

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, activeCurrency, "en-IN");
  };

  // Deprecated - acts exactly like formatAmount to prevent hidden conversions
  const convertAndFormat = (amount: number) => formatAmount(amount);

  return {
    currency: activeCurrency,
    symbol: "₹",
    isLoading: false,
    formatAmount,
    convertAndFormat,
  };
}
