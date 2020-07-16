import commonCurrency from './commonCurrency.json';

export const currencyOutput = (code) => {
  if (!code in commonCurrency) {
    console.log("WARNING: " + code + " is not part of the common currency in the system");
    return "$"
  } else {
    return commonCurrency[code]['symbol_native'];
  }
};