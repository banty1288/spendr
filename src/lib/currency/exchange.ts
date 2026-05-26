// Exchange Rate Architecture (Base: USD)
// In a real app, this would fetch from a service like OpenExchangeRates or Fixer.io.
// For this MVP, we use live fallback rates.

const MOCK_LIVE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
};

const CACHE_KEY = "spendr_exchange_rates";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { timestamp, rates } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
        return rates;
      }
    }

    // Fetch from Frankfurter (Base USD)
    const response = await fetch("https://api.frankfurter.app/latest?from=USD");
    if (!response.ok) throw new Error("Failed to fetch rates");
    
    const data: FrankfurterResponse = await response.json();
    
    // Construct rates object, ensuring USD is 1.0 since it's our base
    const rates = {
      ...data.rates,
      USD: 1.0
    };

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      rates
    }));

    return rates;
  } catch (error) {
    console.warn("Currency fetch failed. Falling back to offline rates.", error);
    return MOCK_LIVE_RATES;
  }
}

/**
 * Converts a base amount (USD) to the target currency.
 */
export function convertCurrency(
  amount: number,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  const rate = rates[targetCurrency];
  if (!rate) return amount; // Fallback if unsupported
  return amount * rate;
}
