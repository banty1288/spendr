import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRates, convertCurrency, convertToUsd } from "../lib/currency/exchange";
import { useUserData } from "./useUserData";
import { formatCurrency } from "../lib/userDisplay";

export function useCurrency() {
  const { data: userData } = useUserData();
  
  // Use user.preferences.currency if available, else settings.app.currency, else USD
  const currencyCode = userData?.preferences?.currency || userData?.settings?.app?.currency || "USD";
  const language = userData?.preferences?.language || userData?.settings?.app?.language || "en";

  const { data: rates, isLoading } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: fetchExchangeRates,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  const convertAndFormat = (baseAmountUsd: number) => {
    if (isLoading || !rates) {
      // Fallback while loading
      return formatCurrency(baseAmountUsd, currencyCode, language);
    }
    
    const converted = convertCurrency(baseAmountUsd, currencyCode, rates);
    return formatCurrency(converted, currencyCode, language);
  };

  const toUsd = (amount: number) => {
    if (isLoading || !rates) return amount;
    return convertToUsd(amount, currencyCode, rates);
  };

  return {
    currencyCode,
    language,
    isLoading,
    convertAndFormat,
    toUsd,
  };
}
