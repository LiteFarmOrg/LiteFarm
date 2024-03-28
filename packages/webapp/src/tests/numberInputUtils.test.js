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

import { expect, describe, test } from 'vitest';
import { countDecimalPlaces, clamp } from '../components/Form/NumberInput/utils';

describe('numberInput utility tests', () => {
  describe('countDecimalPlaces', () => {
    test(`should return correct number of decimal places for positive numbers`, () => {
      expect(countDecimalPlaces(1.11)).toBe(2);
      expect(countDecimalPlaces(2.1)).toBe(1);
      expect(countDecimalPlaces(0.00001)).toBe(5);
    });

    test(`should return correct number of decimal places for negative numbers`, () => {
      expect(countDecimalPlaces(-6)).toBe(0);
      expect(countDecimalPlaces(-1.1)).toBe(1);
      expect(countDecimalPlaces(-1.11)).toBe(2);
    });

    test(`should return 0 for whole numbers`, () => {
      expect(countDecimalPlaces(1)).toBe(0);
      expect(countDecimalPlaces(0)).toBe(0);
      expect(countDecimalPlaces(2300)).toBe(0);
      expect(countDecimalPlaces(92.0)).toBe(0);
    });

    test(`should return 0 non-finite numbers`, () => {
      expect(countDecimalPlaces(Infinity)).toBe(0);
      expect(countDecimalPlaces(-Infinity)).toBe(0);
      expect(countDecimalPlaces(NaN)).toBe(0);
    });

    test(`should return 0 non-numeric values`, () => {
      expect(countDecimalPlaces(undefined)).toBe(0);
      expect(countDecimalPlaces(null)).toBe(0);
      expect(countDecimalPlaces('11.384')).toBe(0);
      expect(countDecimalPlaces(true)).toBe(0);
      expect(countDecimalPlaces(false)).toBe(0);
      expect(countDecimalPlaces([])).toBe(0);
      expect(countDecimalPlaces({})).toBe(0);
    });
  });

  describe('clamp', () => {
    test('should return min when value is less than min', () => {
      expect(clamp(2, 4, 7)).toBe(4);
    });
    test('should return max when value is greater than max', () => {
      expect(clamp(13, 4, 7)).toBe(7);
    });
    test('should return value when value is between min and max', () => {
      expect(clamp(5, 4, 7)).toBe(5);
    });
  });
});
