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

import { describe, expect, it } from 'vitest';
import {
  RowSpecError,
  countRowStatuses,
  formatRowSpec,
  hasRowResults,
  parseRowSpec,
  rowNumbersInPlan,
} from '../util/taskRows';

describe('parseRowSpec', () => {
  it('reads rows and ranges, sorted and without duplicates', () => {
    expect(parseRowSpec('21, 12-14,13')).toEqual([12, 13, 14, 21]);
    expect(parseRowSpec(' 7 ')).toEqual([7]);
    expect(parseRowSpec('3 - 5')).toEqual([3, 4, 5]);
  });

  it.each([
    ['', 'EMPTY'],
    ['   ', 'EMPTY'],
    ['a', 'UNREADABLE'],
    ['1,,2', 'UNREADABLE'],
    ['-3', 'UNREADABLE'],
    ['1.5', 'UNREADABLE'],
    ['9007199254740992', 'UNREADABLE'],
    ['1-9007199254740992', 'UNREADABLE'],
    ['9007199254740992-9007199254740992', 'UNREADABLE'],
    ['9'.repeat(400), 'UNREADABLE'],
    ['18-12', 'BACKWARDS'],
    ['0-2000', 'TOO_MANY'],
    ['0-1000,1001-2001', 'TOO_MANY'],
  ])('refuses %j with %s', (text, code) => {
    expect(() => parseRowSpec(text)).toThrowError(RowSpecError);
    try {
      parseRowSpec(text);
    } catch (e) {
      expect((e as RowSpecError).code).toBe(code);
    }
  });

  it('allows the most rows the api allows', () => {
    expect(parseRowSpec('0-1999')).toHaveLength(2000);
    expect(parseRowSpec('9007199254740990-9007199254740991')).toEqual([
      Number.MAX_SAFE_INTEGER - 1,
      Number.MAX_SAFE_INTEGER,
    ]);
  });

  it('names the part it cannot read', () => {
    try {
      parseRowSpec('1-3,x');
    } catch (e) {
      expect((e as RowSpecError).part).toBe('x');
    }
  });
});

describe('formatRowSpec', () => {
  it('collapses runs of three or more and leaves pairs alone', () => {
    expect(formatRowSpec([12, 13, 14, 15, 16, 17, 18, 21])).toBe('12-18,21');
    expect(formatRowSpec([12, 13])).toBe('12,13');
    expect(formatRowSpec([5, 3, 4, 4])).toBe('3-5');
    expect(formatRowSpec([])).toBe('');
  });

  it('round-trips through parseRowSpec', () => {
    const numbers = [0, 1, 2, 5, 7, 8, 20, 21, 22, 23];
    expect(parseRowSpec(formatRowSpec(numbers))).toEqual(numbers);
  });
});

describe('rowNumbersInPlan', () => {
  it('lists each row once, ignoring the field outline and the path', () => {
    const row = (n: number) => ({ properties: { role: 'row', row: n } });
    expect(
      rowNumbersInPlan({
        features: [
          { properties: { role: 'field' } },
          row(2),
          row(1),
          row(2),
          { properties: { role: 'path' } },
        ],
      }),
    ).toEqual([1, 2]);
    expect(rowNumbersInPlan(null)).toEqual([]);
  });
});

describe('task row status', () => {
  it('counts a row once however many fragments it has', () => {
    const rows = [
      { row_number: 1, status: 'done' as const },
      { row_number: 2, status: 'done' as const },
      { row_number: 2, status: 'pending' as const },
      { row_number: 3, status: 'aborted' as const },
      { row_number: 4, status: 'pending' as const },
    ];
    expect(countRowStatuses(rows)).toEqual({ pending: 2, done: 1, aborted: 1 });
    expect(hasRowResults(rows)).toBe(true);
    expect(hasRowResults([{ row_number: 4, status: 'pending' }])).toBe(false);
    expect(hasRowResults(undefined)).toBe(false);
  });
});
