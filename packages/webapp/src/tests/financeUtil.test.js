/*
 *  Copyright 2023 LiteFarm.org
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
import i18n from '../locales/i18n';
import { filterExpensesByDateRange, formatTransactionDate } from '../containers/Finances/util';
import { sortAllocations } from '../components/Finances/PureExpenseDetail/index.jsx';

describe('Finance utility tests', () => {
  describe('format transaction date in English', () => {
    test(`Today's date should be "Today"`, () => {
      const today = new Date();
      expect(formatTransactionDate(today, 'en')).toBe(i18n.t('common:TODAY'));
    });
    test(`The previous date should be "Yesterday"`, () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatTransactionDate(yesterday, 'en')).toBe(i18n.t('common:YESTERDAY'));
    });
    test('"2024-01-01" should be "January 1, 2024"', () => {
      const date = new Date(2024, 0, 1);
      expect(formatTransactionDate(date, 'en')).toBe('January 1, 2024');
    });
  });

  describe('sort allocations', () => {
    test('should sort allocations by label', () => {
      const allocations = [
        { id: '4B', allocated_value: 10 },
        { id: '5A', allocated_value: 20 },
        { id: '2D', allocated_value: 30 },
        { id: '1E', allocated_value: 40 },
      ];
      const options = [
        { value: '5A', label: 'A' },
        { value: '4B', label: 'B' },
        { value: '3C', label: 'C' },
        { value: '2D', label: 'D' },
        { value: '1E', label: 'E' },
      ];
      expect(sortAllocations(allocations, options)).toEqual([
        { id: '5A', allocated_value: 20 },
        { id: '4B', allocated_value: 10 },
        { id: '2D', allocated_value: 30 },
        { id: '1E', allocated_value: 40 },
      ]);
    });
  });

  describe('filterExpensesByDateRange', () => {
    test('keeps only expenses inside the inclusive range', () => {
      const result = filterExpensesByDateRange(
        [
          {
            farm_expense_id: 1000,
            expense_type_id: 10,
            expense_date: '2025-04-05',
            value: 60,
          },
          {
            farm_expense_id: 1001,
            expense_type_id: 11,
            expense_date: '2025-06-15',
            value: 30,
          },
          {
            farm_expense_id: 1002,
            expense_type_id: 11,
            expense_date: '2025-07-01',
            value: 25,
          },
          {
            farm_expense_id: 1003,
            expense_type_id: 10,
            expense_date: '2024-10-01',
            value: 500,
          },
        ],
        '2025-04-01',
        '2025-06-30',
      );
      expect(result.map((e) => e.farm_expense_id)).toEqual([1000, 1001]);
    });

    test('returns an empty array when input is not an array', () => {
      expect(filterExpensesByDateRange(undefined, '2025-01-01', '2025-12-31')).toEqual([]);
    });
  });
});
