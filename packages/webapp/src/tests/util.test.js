/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
import { getFirstNameLastName } from '../util';

describe('Util test', () => {
  describe('getFirstNameLastName test', () => {
    test('should parse name with only first name correctly', () => {
      const { first_name, last_name } = getFirstNameLastName('first');
      expect(first_name).toEqual('first');
      expect(last_name).toEqual('');
    });
    test('should parse name with first and last names correctly', () => {
      const { first_name, last_name } = getFirstNameLastName('first last');
      expect(first_name).toEqual('first');
      expect(last_name).toEqual('last');
    });
    test('should parse name with first, middle and last names correctly', () => {
      const { first_name, last_name } = getFirstNameLastName('first middle last');
      expect(first_name).toEqual('first');
      expect(last_name).toEqual('middle last');
    });
  });
});
