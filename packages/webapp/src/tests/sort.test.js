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
import { descendingComparator, getComparator } from '../util/sort';

describe('Sort test', () => {
  describe('descendingComparator test', () => {
    const FIRST_COMES_BEFORE = -1;
    const SECOND_COMES_BEFORE = 1;
    const SAME = 0;

    const nullData = { value: null };
    const undefinedData = { value: undefined };

    describe('Compare numbers', () => {
      const zero = { value: 0 };
      const one = { value: 1 };
      const two = { value: 2 };
      const negativeOne = { value: -1 };
      const negativeTwo = { value: -2 };

      test('should compare positive numbers correctly', () => {
        expect(descendingComparator(zero, one, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(one, zero, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(one, one, 'value')).toBe(SAME);
        expect(descendingComparator(one, two, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(two, one, 'value')).toBe(FIRST_COMES_BEFORE);
      });

      test('should compare negative numbers correctly', () => {
        expect(descendingComparator(negativeOne, zero, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(zero, negativeOne, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(negativeOne, negativeOne, 'value')).toBe(SAME);
        expect(descendingComparator(negativeTwo, negativeOne, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(negativeOne, negativeTwo, 'value')).toBe(FIRST_COMES_BEFORE);
      });

      test('should compare positive and negative numbers correctly', () => {
        expect(descendingComparator(negativeOne, one, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(one, negativeTwo, 'value')).toBe(FIRST_COMES_BEFORE);
      });

      test('should compare numbers and undefined/null correctly', () => {
        expect(descendingComparator(negativeOne, nullData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(one, nullData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(zero, nullData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(negativeOne, undefinedData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(one, undefinedData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(zero, undefinedData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(nullData, negativeOne, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(nullData, one, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(nullData, zero, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(undefinedData, negativeOne, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(undefinedData, one, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(undefinedData, zero, 'value')).toBe(FIRST_COMES_BEFORE);
      });
    });

    describe('Compare strings', () => {
      const empty = { value: '' };
      const a = { value: 'a' };
      const z = { value: 'z' };

      test('should compare strings correctly', () => {
        expect(descendingComparator(a, z, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(z, a, 'value')).toBe(FIRST_COMES_BEFORE);
      });

      test('should compare string and empty string correctly', () => {
        expect(descendingComparator(empty, z, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(z, empty, 'value')).toBe(SECOND_COMES_BEFORE);
      });

      test('should compare strings and undefined/null correctly', () => {
        expect(descendingComparator(a, nullData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(a, undefinedData, 'value')).toBe(SECOND_COMES_BEFORE);
        expect(descendingComparator(nullData, a, 'value')).toBe(FIRST_COMES_BEFORE);
        expect(descendingComparator(undefinedData, a, 'value')).toBe(FIRST_COMES_BEFORE);
      });
    });
  });

  describe('getComparator test', () => {
    const createSortable = (array) => array.map((value) => ({ value }));

    test('Sort strings', () => {
      const sortable = createSortable(['l', 'i', 't', 'e', null, 'f', 'a', 'r', 'm']);
      const asc = ['a', 'e', 'f', 'i', 'l', 'm', 'r', 't', null];
      expect(sortable.sort(getComparator('asc', 'value'))).toEqual(createSortable(asc));
      expect(sortable.sort(getComparator('desc', 'value'))).toEqual(createSortable(asc.reverse()));
    });

    test('Sort numbers', () => {
      const sortable = createSortable([2, 0, 2, 5, -1, null, 1, 2, 0, 2]);
      const asc = [-1, 0, 0, 1, 2, 2, 2, 2, 5, null];
      expect(sortable.sort(getComparator('asc', 'value'))).toEqual(createSortable(asc));
      expect(sortable.sort(getComparator('desc', 'value'))).toEqual(createSortable(asc.reverse()));
    });
  });
});
