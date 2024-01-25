export function countDecimalPlaces(number: number) {
  if (!Number.isFinite(number)) return 0;
  let e = 1;
  let decimalPlaces = 0;
  while ((number * e) % 1 !== 0) {
    e *= 10;
    decimalPlaces += 1;
  }
  return decimalPlaces;
}
