export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateFromINR: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee',       flag: '\uD83C\uDDEE\uD83C\uDDF3', rateFromINR: 1 },
  { code: 'SGD', symbol: 'S$',     name: 'Singapore Dollar',   flag: '\uD83C\uDDF8\uD83C\uDDEC', rateFromINR: 0.016 },
  { code: 'USD', symbol: 'US$',    name: 'US Dollar',          flag: '\uD83C\uDDFA\uD83C\uDDF8', rateFromINR: 0.012 },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro',               flag: '\uD83C\uDDEA\uD83C\uDDFA', rateFromINR: 0.011 },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound',      flag: '\uD83C\uDDEC\uD83C\uDDE7', rateFromINR: 0.0095 },
  { code: 'AED', symbol: 'AED',    name: 'UAE Dirham',         flag: '\uD83C\uDDE6\uD83C\uDDEA', rateFromINR: 0.044 },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen',       flag: '\uD83C\uDDEF\uD83C\uDDF5', rateFromINR: 1.82 },
  { code: 'AUD', symbol: 'A$',     name: 'Australian Dollar',  flag: '\uD83C\uDDE6\uD83C\uDDFA', rateFromINR: 0.018 },
  { code: 'MYR', symbol: 'RM',     name: 'Malaysian Ringgit',  flag: '\uD83C\uDDF2\uD83C\uDDFE', rateFromINR: 0.053 },
];

export function convertFromINR(amountINR: number, toCurrency: Currency): string {
  const converted = amountINR * toCurrency.rateFromINR;
  if (converted >= 1000) return `${toCurrency.symbol}${(converted / 1000).toFixed(1)}k`;
  if (converted < 1) return `${toCurrency.symbol}${converted.toFixed(2)}`;
  return `${toCurrency.symbol}${converted.toFixed(0)}`;
}

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
