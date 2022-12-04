import { useSelector } from 'react-redux';
import { currencySelector } from '../userFarmSlice.js';
import commonCurrency from '../AddFarm/currency/commonCurrency.json';

// TODO: Test code splitting on commonCurrency.json
export function useCurrencySymbol() {
  const currency = useSelector(currencySelector);
  return commonCurrency[currency]?.['symbol_native'] || '$';
}
