/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

export function countDecimalPlaces(number: number) {
  if (!Number.isFinite(number)) return 0;
  let e = 1;
  let decimalPlaces = 0;
  while (Math.round(number * e) / e !== number) {
    e *= 10;
    decimalPlaces += 1;
  }
  return decimalPlaces;
}

export function clamp(value: number, min: number, max: number) {
  if (max < min) console.warn('clamp: max cannot be less than min');

  return Math.min(Math.max(value, min), max);
}

export function createNumberFormatter(locale: string, options?: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch (error) {
    // undefined will use browsers best matching locale
    return new Intl.NumberFormat(undefined, options);
  }
}
