interface UpiParams {
  pa: string; // Payee VPA
  pn: string; // Payee Name
  am?: string; // Amount
  cu?: string; // Currency
  tn?: string; // Transaction Note
}

export function generateUpiIntent(params: UpiParams): string {
  const url = new URL('upi://pay');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}
