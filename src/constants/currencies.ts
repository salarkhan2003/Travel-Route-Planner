export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateFromINR: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',        flag: '🇮🇳', rateFromINR: 1 },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',    flag: '🇸🇬', rateFromINR: 0.016 },
  { code: 'USD', symbol: '$',   name: 'US Dollar',           flag: '🇺🇸', rateFromINR: 0.012 },
  { code: 'EUR', symbol: '€',   name: 'Euro',                flag: '🇪🇺', rateFromINR: 0.011 },
  { code: 'GBP', symbol: '£',   name: 'British Pound',       flag: '🇬🇧', rateFromINR: 0.0095 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',          flag: '🇦🇪', rateFromINR: 0.044 },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',        flag: '🇯🇵', rateFromINR: 1.82 },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',   flag: '🇦🇺', rateFromINR: 0.018 },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit',   flag: '🇲🇾', rateFromINR: 0.053 },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht',           flag: '🇹🇭', rateFromINR: 0.42 },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',     flag: '🇨🇦', rateFromINR: 0.016 },
  { code: 'CHF', symbol: 'Fr',  name: 'Swiss Franc',         flag: '🇨🇭', rateFromINR: 0.011 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar',    flag: '🇭🇰', rateFromINR: 0.094 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar',  flag: '🇳🇿', rateFromINR: 0.020 },
  { code: 'SAR', symbol: 'SR',  name: 'Saudi Riyal',         flag: '🇸🇦', rateFromINR: 0.045 },
  { code: 'QAR', symbol: 'QR',  name: 'Qatari Riyal',        flag: '🇶🇦', rateFromINR: 0.044 },
  { code: 'KWD', symbol: 'KD',  name: 'Kuwaiti Dinar',       flag: '🇰🇼', rateFromINR: 0.0037 },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah',   flag: '🇮🇩', rateFromINR: 196 },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso',     flag: '🇵🇭', rateFromINR: 0.68 },
  { code: 'KRW', symbol: '₩',   name: 'South Korean Won',    flag: '🇰🇷', rateFromINR: 16.4 },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',        flag: '🇨🇳', rateFromINR: 0.087 },
  { code: 'BDT', symbol: '৳',   name: 'Bangladeshi Taka',    flag: '🇧🇩', rateFromINR: 1.32 },
  { code: 'PKR', symbol: 'Rs',  name: 'Pakistani Rupee',     flag: '🇵🇰', rateFromINR: 3.35 },
  { code: 'LKR', symbol: 'Rs',  name: 'Sri Lankan Rupee',    flag: '🇱🇰', rateFromINR: 3.65 },
  { code: 'NPR', symbol: 'Rs',  name: 'Nepalese Rupee',      flag: '🇳🇵', rateFromINR: 1.60 },
  { code: 'BHD', symbol: 'BD',  name: 'Bahraini Dinar',      flag: '🇧🇭', rateFromINR: 0.0045 },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial',          flag: '🇴🇲', rateFromINR: 0.0046 },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',  flag: '🇿🇦', rateFromINR: 0.22 },
  { code: 'TRY', symbol: '₺',   name: 'Turkish Lira',        flag: '🇹🇷', rateFromINR: 0.39 },
  { code: 'RUB', symbol: '₽',   name: 'Russian Ruble',       flag: '🇷🇺', rateFromINR: 1.10 },
];

export function convertFromINR(amountINR: number, toCurrency: Currency): string {
  const converted = amountINR * toCurrency.rateFromINR;
  if (converted >= 1000000) return `${toCurrency.symbol}${(converted / 1000000).toFixed(1)}M`;
  if (converted >= 1000) return `${toCurrency.symbol}${(converted / 1000).toFixed(1)}k`;
  if (converted < 1) return `${toCurrency.symbol}${converted.toFixed(3)}`;
  return `${toCurrency.symbol}${converted.toFixed(0)}`;
}

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
