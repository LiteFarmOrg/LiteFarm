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
import { getTicks } from '../components/Charts/utils';

export const getLocalDate = (date) => {
  const [y, m, d] = date.split('-');
  return new Date(+y, +m - 1, +d);
};

const convertDateStringToUnixTime = (date) => {
  return getLocalDate(date).getTime() / 1000;
};

describe('Test getTicks', () => {
  describe('Daily ticks', () => {
    test('get daily ticks correctly', () => {
      const testCases = [
        {
          input: ['2025-03-01', '2025-03-07'],
          expectedTicks: [
            '2025-03-01',
            '2025-03-02',
            '2025-03-03',
            '2025-03-04',
            '2025-03-05',
            '2025-03-06',
            '2025-03-07',
          ],
        },
        {
          input: ['2025-12-28', '2026-01-03'],
          expectedTicks: [
            '2025-12-28',
            '2025-12-29',
            '2025-12-30',
            '2025-12-31',
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
          ],
        },
        {
          input: ['2025-06-30', '2025-06-30'],
          expectedTicks: ['2025-06-30'],
        },
        {
          input: ['2025-06-30', '2025-07-01'],
          expectedTicks: ['2025-06-30', '2025-07-01'],
        },
      ];

      testCases.forEach(({ input: [startDate, endDate], expectedTicks }) => {
        const ticks = getTicks(getLocalDate(startDate), getLocalDate(endDate));
        expect(ticks).toEqual(expectedTicks.map(convertDateStringToUnixTime));
      });
    });

    test('handle leap year correctly', () => {
      const ticks = getTicks(getLocalDate('2024-02-28'), getLocalDate('2024-03-05'));
      expect(ticks).toEqual(
        [
          '2024-02-28',
          '2024-02-29',
          '2024-03-01',
          '2024-03-02',
          '2024-03-03',
          '2024-03-04',
          '2024-03-05',
        ].map(convertDateStringToUnixTime),
      );
    });

    // Can be tested locally by setting machine's time zone manually
    test('handle Daylight Saving Time boundaries correctly', () => {
      // Daylight Saving Time starts: 2025-03-09 (North America)
      let ticks = getTicks(getLocalDate('2025-03-08'), getLocalDate('2025-03-12'));
      expect(ticks).toEqual(
        ['2025-03-08', '2025-03-09', '2025-03-10', '2025-03-11', '2025-03-12'].map(
          convertDateStringToUnixTime,
        ),
      );

      // Daylight Saving Time starts: 2025-03-29 (Europe)
      ticks = getTicks(getLocalDate('2025-03-27'), getLocalDate('2025-03-31'));
      expect(ticks).toEqual(
        ['2025-03-27', '2025-03-28', '2025-03-29', '2025-03-30', '2025-03-31'].map(
          convertDateStringToUnixTime,
        ),
      );

      // Daylight Saving Time ends: 2025-11-02 (North America), 2025-10-25 (Europe)
      ticks = getTicks(getLocalDate('2025-10-30'), getLocalDate('2025-11-05'));
      expect(ticks).toEqual(
        [
          '2025-10-30',
          '2025-10-31',
          '2025-11-01',
          '2025-11-02',
          '2025-11-03',
          '2025-11-04',
          '2025-11-05',
        ].map(convertDateStringToUnixTime),
      );
    });

    test('return maximum of 7 ticks', () => {
      const testCases = [
        {
          input: ['2025-03-01', '2025-03-10'],
          expectedTicks: ['2025-03-01', '2025-03-03', '2025-03-05', '2025-03-07', '2025-03-09'],
        },
        {
          input: ['2025-03-02', '2025-03-10'],
          expectedTicks: ['2025-03-02', '2025-03-04', '2025-03-06', '2025-03-08', '2025-03-10'],
        },
        {
          input: ['2025-03-01', '2025-03-31'],
          expectedTicks: [
            '2025-03-01',
            '2025-03-06',
            '2025-03-11',
            '2025-03-16',
            '2025-03-21',
            '2025-03-26',
            '2025-03-31',
          ],
        },
        {
          input: ['2025-02-21', '2025-03-10'],
          expectedTicks: [
            '2025-02-21',
            '2025-02-24',
            '2025-02-27',
            '2025-03-02',
            '2025-03-05',
            '2025-03-08',
          ],
        },
        {
          // leap year
          input: ['2024-02-21', '2024-03-10'],
          expectedTicks: [
            '2024-02-21',
            '2024-02-24',
            '2024-02-27',
            '2024-03-01',
            '2024-03-04',
            '2024-03-07',
            '2024-03-10',
          ],
        },
      ];
      testCases.forEach(({ input: [startDate, endDate], expectedTicks }) => {
        const ticks = getTicks(getLocalDate(startDate), getLocalDate(endDate));
        expect(ticks).toEqual(expectedTicks.map(convertDateStringToUnixTime));
      });
    });
  });

  describe('Monthly ticks', () => {
    test('get monthly ticks correctly', () => {
      const testCases = [
        {
          input: ['2025-01-01', '2025-02-28'],
          expectedTicks: ['2025-01-01', '2025-02-01'],
        },
        {
          input: ['2025-01-15', '2025-04-10'],
          expectedTicks: ['2025-02-01', '2025-03-01', '2025-04-01'],
        },
        {
          input: ['2024-12-01', '2025-06-01'],
          expectedTicks: [
            '2024-12-01',
            '2025-01-01',
            '2025-02-01',
            '2025-03-01',
            '2025-04-01',
            '2025-05-01',
            '2025-06-01',
          ],
        },
      ];

      testCases.forEach(({ input: [startDate, endDate], expectedTicks }) => {
        const ticks = getTicks(getLocalDate(startDate), getLocalDate(endDate));
        expect(ticks).toEqual(expectedTicks.map(convertDateStringToUnixTime));
      });
    });

    test('return maximum of 7 ticks', () => {
      const testCases = [
        {
          input: ['2025-01-01', '2025-12-31'],
          expectedTicks: [
            '2025-01-01',
            '2025-03-01',
            '2025-05-01',
            '2025-07-01',
            '2025-09-01',
            '2025-11-01',
          ],
        },
        {
          input: ['2024-12-01', '2026-12-01'],
          expectedTicks: [
            '2024-12-01',
            '2025-04-01',
            '2025-08-01',
            '2025-12-01',
            '2026-04-01',
            '2026-08-01',
            '2026-12-01',
          ],
        },
      ];

      testCases.forEach(({ input: [startDate, endDate], expectedTicks }) => {
        const ticks = getTicks(getLocalDate(startDate), getLocalDate(endDate));
        expect(ticks).toEqual(expectedTicks.map(convertDateStringToUnixTime));
      });
    });

    test('handle leap year correctly', () => {
      const ticks = getTicks(getLocalDate('2024-01-01'), getLocalDate('2024-06-01'));
      expect(ticks).toEqual(
        ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01'].map(
          convertDateStringToUnixTime,
        ),
      );
    });
  });

  describe('choose appropriate tick span', () => {
    test('get daily ticks when the date range includes fewer than two first days of a month', () => {
      let ticks = getTicks(getLocalDate('2025-01-01'), getLocalDate('2025-01-31'));
      expect(ticks).toEqual(
        [
          '2025-01-01',
          '2025-01-06',
          '2025-01-11',
          '2025-01-16',
          '2025-01-21',
          '2025-01-26',
          '2025-01-31',
        ].map(convertDateStringToUnixTime),
      );

      ticks = getTicks(getLocalDate('2025-01-02'), getLocalDate('2025-02-28'));
      expect(ticks).toEqual(
        [
          '2025-01-02',
          '2025-01-11',
          '2025-01-20',
          '2025-01-29',
          '2025-02-07',
          '2025-02-16',
          '2025-02-25',
        ].map(convertDateStringToUnixTime),
      );
    });

    test('get monthly ticks when the date range includes two or more first days of a month', () => {
      let ticks = getTicks(getLocalDate('2025-01-01'), getLocalDate('2025-02-01'));
      expect(ticks).toEqual(['2025-01-01', '2025-02-01'].map(convertDateStringToUnixTime));

      ticks = getTicks(getLocalDate('2025-01-01'), getLocalDate('2025-02-28'));
      expect(ticks).toEqual(['2025-01-01', '2025-02-01'].map(convertDateStringToUnixTime));
    });
  });
});
