import { useSettingsStore } from '../store/settingsStore';
import { CURRENCIES, convertFromINR } from '../constants/currencies';

export function useCurrency() {
  // Subscribes to currency changes — re-renders any component using this hook
  const currencyCode = useSettingsStore((s) => s.currency);
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  /** Format an INR amount into the selected currency string */
  const fmt = (amountINR: number): string => convertFromINR(amountINR, currency);

  /** Format with label e.g. "₹1,200" or "S$19" */
  const fmtFull = (amountINR: number): string => {
    const converted = amountINR * currency.rateFromINR;
    if (converted >= 100000) return `${currency.symbol}${(converted / 100000).toFixed(1)}L`;
    if (converted >= 1000) return `${currency.symbol}${(converted / 1000).toFixed(1)}k`;
    return `${currency.symbol}${converted.toFixed(0)}`;
  };

  return { currency, fmt, fmtFull, symbol: currency.symbol, code: currency.code };
}
