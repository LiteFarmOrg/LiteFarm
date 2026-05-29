/*
 *  Copyright 2026 LiteFarm.org
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

import { describe, expect, test } from 'vitest';
import {
  buildDateRangeOptions,
  findDynamicDateRange,
  isStaticDateRangeOption,
} from '../components/DateRangeSelector/helpers';
import { DateRangeOptions } from '../components/DateRangeSelector/types';

const echoT = (key) => key;

describe('buildDateRangeOptions', () => {
  test('returns the default static option set when no allowedOptions or dynamicOptions are passed', () => {
    const result = buildDateRangeOptions(echoT);
    expect(result.map((entry) => entry.value)).toEqual([
      DateRangeOptions.YEAR_TO_DATE,
      DateRangeOptions.LAST_7_DAYS,
      DateRangeOptions.LAST_14_DAYS,
      DateRangeOptions.LAST_30_DAYS,
      DateRangeOptions.THIS_WEEK,
      DateRangeOptions.LAST_WEEK,
      DateRangeOptions.THIS_MONTH,
      DateRangeOptions.LAST_MONTH,
      DateRangeOptions.CUSTOM,
    ]);
  });

  test('does not include LAST_12_MONTHS in the default set', () => {
    const result = buildDateRangeOptions(echoT);
    expect(result.map((entry) => entry.value)).not.toContain(DateRangeOptions.LAST_12_MONTHS);
  });

  test('filters and orders by allowedOptions', () => {
    const result = buildDateRangeOptions(echoT, [
      DateRangeOptions.YEAR_TO_DATE,
      DateRangeOptions.LAST_12_MONTHS,
      DateRangeOptions.CUSTOM,
    ]);
    expect(result.map((entry) => entry.value)).toEqual([
      DateRangeOptions.YEAR_TO_DATE,
      DateRangeOptions.LAST_12_MONTHS,
      DateRangeOptions.CUSTOM,
    ]);
  });

  test('translates the LAST_12_MONTHS label through the supplied t function', () => {
    const result = buildDateRangeOptions(echoT, [DateRangeOptions.LAST_12_MONTHS]);
    expect(result).toEqual([
      { value: DateRangeOptions.LAST_12_MONTHS, label: 'DATE_RANGE_SELECTOR.LAST_12_MONTHS' },
    ]);
  });

  test('inserts dynamicOptions between the static options and the CUSTOM row', () => {
    const dynamic = [
      { value: 'year_2025', label: '2025', startDate: '2025-01-01', endDate: '2025-12-31' },
      { value: 'year_2024', label: '2024', startDate: '2024-01-01', endDate: '2024-12-31' },
    ];
    const result = buildDateRangeOptions(
      echoT,
      [DateRangeOptions.YEAR_TO_DATE, DateRangeOptions.LAST_12_MONTHS, DateRangeOptions.CUSTOM],
      dynamic,
    );
    expect(result.map((entry) => entry.value)).toEqual([
      DateRangeOptions.YEAR_TO_DATE,
      DateRangeOptions.LAST_12_MONTHS,
      'year_2025',
      'year_2024',
      DateRangeOptions.CUSTOM,
    ]);
  });

  test('appends dynamicOptions when no CUSTOM row is present', () => {
    const dynamic = [
      { value: 'year_2025', label: '2025', startDate: '2025-01-01', endDate: '2025-12-31' },
    ];
    const result = buildDateRangeOptions(
      echoT,
      [DateRangeOptions.YEAR_TO_DATE, DateRangeOptions.LAST_12_MONTHS],
      dynamic,
    );
    expect(result.map((entry) => entry.value)).toEqual([
      DateRangeOptions.YEAR_TO_DATE,
      DateRangeOptions.LAST_12_MONTHS,
      'year_2025',
    ]);
  });

  test('passes dynamic option labels through verbatim (no translation applied)', () => {
    const dynamic = [
      { value: 'year_2024', label: '2024', startDate: '2024-01-01', endDate: '2024-12-31' },
    ];
    const result = buildDateRangeOptions(echoT, [DateRangeOptions.CUSTOM], dynamic);
    expect(result[0]).toEqual({ value: 'year_2024', label: '2024' });
  });
});

describe('isStaticDateRangeOption', () => {
  test('returns true for every DateRangeOptions enum value', () => {
    for (const value of Object.values(DateRangeOptions)) {
      expect(isStaticDateRangeOption(value)).toBe(true);
    }
  });

  test('returns false for arbitrary dynamic option keys', () => {
    expect(isStaticDateRangeOption('year_2024')).toBe(false);
    expect(isStaticDateRangeOption('q1_2025')).toBe(false);
    expect(isStaticDateRangeOption('')).toBe(false);
  });
});

describe('findDynamicDateRange', () => {
  const dynamic = [
    { value: 'year_2024', label: '2024', startDate: '2024-01-01', endDate: '2024-12-31' },
    { value: 'year_2023', label: '2023', startDate: '2023-01-01', endDate: '2023-12-31' },
  ];

  test('returns the matching entry start/end dates when found', () => {
    expect(findDynamicDateRange('year_2024', dynamic)).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
  });

  test('returns null when the value is not in dynamicOptions', () => {
    expect(findDynamicDateRange('year_2099', dynamic)).toBeNull();
  });

  test('returns null when dynamicOptions is undefined or empty', () => {
    expect(findDynamicDateRange('year_2024')).toBeNull();
    expect(findDynamicDateRange('year_2024', [])).toBeNull();
  });
});
