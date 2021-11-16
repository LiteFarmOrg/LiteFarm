import { getCurrencyFromStore } from './getFromReduxStore';
import commonCurrency from '../containers/AddFarm/currency/commonCurrency.json';

export default function grabCurrencySymbol(currency = getCurrencyFromStore()) {
  if (currency && currency in commonCurrency) {
    return commonCurrency[currency]['symbol_native'];
  } else {
    return '$';
  }
}
