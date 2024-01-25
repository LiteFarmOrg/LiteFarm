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

export function clamp(value: number, min: number, max: number) {
  if (max < min) console.warn('clamp: max cannot be less than min');

  return Math.min(Math.max(value, min), max);
}
