export const validatePassword = (password) => {
  const isTooShort = password.length >= 8;
  const hasNoUpperCase = RegExp(/(?=.*[A-Z])/).test(password);
  const hasNoDigit = RegExp(/(?=.*\d)/).test(password);
  const hasNoSymbol = RegExp(/(?=.*\W)/).test(password);
  const isValid = !isTooShort && !hasNoDigit && !hasNoSymbol && !hasNoUpperCase;
  return {isValid, isTooShort, hasNoUpperCase, hasNoSymbol, hasNoDigit}
}