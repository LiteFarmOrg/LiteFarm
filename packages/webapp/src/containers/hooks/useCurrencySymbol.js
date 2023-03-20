import { useSelector } from 'react-redux';
import { currencySelector } from '../userFarmSlice.js';
import commonCurrency from '../AddFarm/currency/commonCurrency.json';

// TODO: Should not import entire commonCurrency to find one symbol
export function useCurrencySymbol() {
  const currency = useSelector(currencySelector);
  return commonCurrency[currency]?.['symbol_native'] || '$';
}
