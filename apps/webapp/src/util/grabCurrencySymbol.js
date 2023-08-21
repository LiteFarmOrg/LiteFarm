import { getCurrencyFromStore } from '../store/getFromReduxStore';
import commonCurrency from '../containers/AddFarm/currency/commonCurrency.json';

/**
 * @deprecated Do not use in functional component. Use {@link useCurrencySymbol} instead.
 */
export default function grabCurrencySymbol(currency = getCurrencyFromStore()) {
  if (currency && currency in commonCurrency) {
    return commonCurrency[currency]['symbol_native'];
  } else {
    return '$';
  }
}
