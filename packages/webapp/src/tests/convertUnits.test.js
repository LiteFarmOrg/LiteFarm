/*
 *  Copyright 2025 LiteFarm.org
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
import { getDefaultUnit, waterUsage } from '../util/convert-units/unit';

describe('convert-units test', () => {
  describe('getDefaultUnit converts value and unit properly', () => {
    describe('waterUsage', () => {
      test('metric system conversions', () => {
        // 79l
        const lToLResult = getDefaultUnit(waterUsage, 79, 'metric', 'l');
        expect(lToLResult.displayUnit).toEqual('l');
        expect(lToLResult.displayValue).toEqual(79);

        // 790ml
        const mlToMlResult = getDefaultUnit(waterUsage, 790, 'metric', 'ml');
        expect(mlToMlResult.displayUnit).toEqual('ml');
        expect(mlToMlResult.displayValue).toEqual(790);

        // 7900ml (Converts ml to l if >= 1000ml)
        const mlToLResult = getDefaultUnit(waterUsage, 7900, 'metric', 'ml');
        expect(mlToLResult.displayUnit).toEqual('l');
        expect(mlToLResult.displayValue).toEqual(7.9);

        // 0.79l
        const lTomLResult = getDefaultUnit(waterUsage, 0.79, 'metric', 'l');
        expect(lTomLResult.displayUnit).toEqual('ml');
        expect(lTomLResult.displayValue).toEqual(790);
      });

      test('imperial system conversions', () => {
        // 79l
        const lToGalResult = getDefaultUnit(waterUsage, 79, 'imperial', 'l');
        expect(lToGalResult.displayUnit).toEqual('gal');
        expect(lToGalResult.displayValue).toEqual(20.87);

        // 0.79l
        const lToFlozResult = getDefaultUnit(waterUsage, 0.79, 'imperial', 'l');
        expect(lToFlozResult.displayUnit).toEqual('fl-oz');
        expect(lToFlozResult.displayValue).toEqual(26.71);

        // 128 fl-oz
        const flozToGalResult = getDefaultUnit(waterUsage, 128, 'imperial', 'fl-oz');
        expect(flozToGalResult.displayUnit).toEqual('gal');
        expect(flozToGalResult.displayValue).toEqual(1);
      });
    });
  });
});
