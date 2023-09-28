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
import DateRange, { SUNDAY, MONDAY } from '../util/dateRange';
import { dateRangeOptions } from '../components/DateRangeSelector/constants';

const testCases = [
  {
    date: [2023, 12, 31, SUNDAY], // Sunday
    expectedResults: {
      THIS_YEAR: { startDate: '2023-01-01', endDate: '2023-12-31' },
      LAST_7_DAYS: { startDate: '2023-12-25', endDate: '2023-12-31' },
      LAST_14_DAYS: { startDate: '2023-12-18', endDate: '2023-12-31' },
      LAST_30_DAYS: { startDate: '2023-12-02', endDate: '2023-12-31' },
      THIS_WEEK: { startDate: '2023-12-31', endDate: '2024-01-06' },
      LAST_WEEK: { startDate: '2023-12-24', endDate: '2023-12-30' },
      THIS_MONTH: { startDate: '2023-12-01', endDate: '2023-12-31' },
      LAST_MONTH: { startDate: '2023-11-01', endDate: '2023-11-30' },
    },
  },
  {
    date: [2023, 12, 31, MONDAY],
    expectedResults: {
      THIS_YEAR: { startDate: '2023-01-01', endDate: '2023-12-31' },
      LAST_7_DAYS: { startDate: '2023-12-25', endDate: '2023-12-31' },
      LAST_14_DAYS: { startDate: '2023-12-18', endDate: '2023-12-31' },
      LAST_30_DAYS: { startDate: '2023-12-02', endDate: '2023-12-31' },
      THIS_WEEK: { startDate: '2023-12-25', endDate: '2023-12-31' },
      LAST_WEEK: { startDate: '2023-12-18', endDate: '2023-12-24' },
      THIS_MONTH: { startDate: '2023-12-01', endDate: '2023-12-31' },
      LAST_MONTH: { startDate: '2023-11-01', endDate: '2023-11-30' },
    },
  },
  {
    date: [2024, '01', '01', SUNDAY], // Monday
    expectedResults: {
      THIS_YEAR: { startDate: '2024-01-01', endDate: '2024-12-31' },
      LAST_7_DAYS: { startDate: '2023-12-26', endDate: '2024-01-01' },
      LAST_14_DAYS: { startDate: '2023-12-19', endDate: '2024-01-01' },
      LAST_30_DAYS: { startDate: '2023-12-03', endDate: '2024-01-01' },
      THIS_WEEK: { startDate: '2023-12-31', endDate: '2024-01-06' },
      LAST_WEEK: { startDate: '2023-12-24', endDate: '2023-12-30' },
      THIS_MONTH: { startDate: '2024-01-01', endDate: '2024-01-31' },
      LAST_MONTH: { startDate: '2023-12-01', endDate: '2023-12-31' },
    },
  },
  {
    date: [2024, '01', '01', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2024-01-01', endDate: '2024-01-07' },
      LAST_WEEK: { startDate: '2023-12-25', endDate: '2023-12-31' },
    },
  },
  {
    date: [2024, '02', '29', SUNDAY], // Thursday
    expectedResults: {
      THIS_YEAR: { startDate: '2024-01-01', endDate: '2024-12-31' },
      LAST_7_DAYS: { startDate: '2024-02-23', endDate: '2024-02-29' },
      LAST_14_DAYS: { startDate: '2024-02-16', endDate: '2024-02-29' },
      LAST_30_DAYS: { startDate: '2024-01-31', endDate: '2024-02-29' },
      THIS_WEEK: { startDate: '2024-02-25', endDate: '2024-03-02' },
      LAST_WEEK: { startDate: '2024-02-18', endDate: '2024-02-24' },
      THIS_MONTH: { startDate: '2024-02-01', endDate: '2024-02-29' },
      LAST_MONTH: { startDate: '2024-01-01', endDate: '2024-01-31' },
    },
  },
  {
    date: [2024, '02', '29', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2024-02-26', endDate: '2024-03-03' },
      LAST_WEEK: { startDate: '2024-02-19', endDate: '2024-02-25' },
    },
  },
  {
    date: [2023, '11', '07', SUNDAY], // Tuesday
    expectedResults: {
      THIS_YEAR: { startDate: '2023-01-01', endDate: '2023-12-31' },
      LAST_7_DAYS: { startDate: '2023-11-01', endDate: '2023-11-07' },
      LAST_14_DAYS: { startDate: '2023-10-25', endDate: '2023-11-07' },
      LAST_30_DAYS: { startDate: '2023-10-09', endDate: '2023-11-07' },
      THIS_WEEK: { startDate: '2023-11-05', endDate: '2023-11-11' },
      LAST_WEEK: { startDate: '2023-10-29', endDate: '2023-11-04' },
      THIS_MONTH: { startDate: '2023-11-01', endDate: '2023-11-30' },
      LAST_MONTH: { startDate: '2023-10-01', endDate: '2023-10-31' },
    },
  },
  {
    date: [2023, '11', '07', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2023-11-06', endDate: '2023-11-12' },
      LAST_WEEK: { startDate: '2023-10-30', endDate: '2023-11-05' },
    },
  },
  {
    date: [2024, '03', '13', SUNDAY], // Wednesday
    expectedResults: {
      THIS_YEAR: { startDate: '2024-01-01', endDate: '2024-12-31' },
      LAST_7_DAYS: { startDate: '2024-03-07', endDate: '2024-03-13' },
      LAST_14_DAYS: { startDate: '2024-02-29', endDate: '2024-03-13' },
      LAST_30_DAYS: { startDate: '2024-02-13', endDate: '2024-03-13' },
      THIS_WEEK: { startDate: '2024-03-10', endDate: '2024-03-16' },
      LAST_WEEK: { startDate: '2024-03-03', endDate: '2024-03-09' },
      THIS_MONTH: { startDate: '2024-03-01', endDate: '2024-03-31' },
      LAST_MONTH: { startDate: '2024-02-01', endDate: '2024-02-29' },
    },
  },
  {
    date: [2024, '03', '13', MONDAY], // Wednesday
    expectedResults: {
      THIS_WEEK: { startDate: '2024-03-11', endDate: '2024-03-17' },
      LAST_WEEK: { startDate: '2024-03-04', endDate: '2024-03-10' },
    },
  },
  {
    date: [2025, '03', '13', SUNDAY], // Thursday
    expectedResults: {
      THIS_YEAR: { startDate: '2025-01-01', endDate: '2025-12-31' },
      LAST_7_DAYS: { startDate: '2025-03-07', endDate: '2025-03-13' },
      LAST_14_DAYS: { startDate: '2025-02-28', endDate: '2025-03-13' },
      LAST_30_DAYS: { startDate: '2025-02-12', endDate: '2025-03-13' },
      THIS_WEEK: { startDate: '2025-03-09', endDate: '2025-03-15' },
      LAST_WEEK: { startDate: '2025-03-02', endDate: '2025-03-08' },
      THIS_MONTH: { startDate: '2025-03-01', endDate: '2025-03-31' },
      LAST_MONTH: { startDate: '2025-02-01', endDate: '2025-02-28' },
    },
  },
  {
    date: [2025, '03', '13', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2025-03-10', endDate: '2025-03-16' },
      LAST_WEEK: { startDate: '2025-03-03', endDate: '2025-03-09' },
    },
  },
  {
    date: [2024, '07', '19', SUNDAY], // Friday
    expectedResults: {
      THIS_YEAR: { startDate: '2024-01-01', endDate: '2024-12-31' },
      LAST_7_DAYS: { startDate: '2024-07-13', endDate: '2024-07-19' },
      LAST_14_DAYS: { startDate: '2024-07-06', endDate: '2024-07-19' },
      LAST_30_DAYS: { startDate: '2024-06-20', endDate: '2024-07-19' },
      THIS_WEEK: { startDate: '2024-07-14', endDate: '2024-07-20' },
      LAST_WEEK: { startDate: '2024-07-07', endDate: '2024-07-13' },
      THIS_MONTH: { startDate: '2024-07-01', endDate: '2024-07-31' },
      LAST_MONTH: { startDate: '2024-06-01', endDate: '2024-06-30' },
    },
  },
  {
    date: [2024, '07', '19', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2024-07-15', endDate: '2024-07-21' },
      LAST_WEEK: { startDate: '2024-07-08', endDate: '2024-07-14' },
    },
  },
  {
    date: [2024, '10', '26', SUNDAY], // Saturday
    expectedResults: {
      THIS_YEAR: { startDate: '2024-01-01', endDate: '2024-12-31' },
      LAST_7_DAYS: { startDate: '2024-10-20', endDate: '2024-10-26' },
      LAST_14_DAYS: { startDate: '2024-10-13', endDate: '2024-10-26' },
      LAST_30_DAYS: { startDate: '2024-09-27', endDate: '2024-10-26' },
      THIS_WEEK: { startDate: '2024-10-20', endDate: '2024-10-26' },
      LAST_WEEK: { startDate: '2024-10-13', endDate: '2024-10-19' },
      THIS_MONTH: { startDate: '2024-10-01', endDate: '2024-10-31' },
      LAST_MONTH: { startDate: '2024-09-01', endDate: '2024-09-30' },
    },
  },
  {
    date: [2024, '10', '26', MONDAY],
    expectedResults: {
      THIS_WEEK: { startDate: '2024-10-21', endDate: '2024-10-27' },
      LAST_WEEK: { startDate: '2024-10-14', endDate: '2024-10-20' },
    },
  },
];

describe('DateRange class tests', () => {
  testCases.forEach(({ date: [year, month, day, weekStartDay], expectedResults }) => {
    describe(`Base date: ${year}-${month}-${day}, Week start day: ${weekStartDay}`, () => {
      const date = new Date(+year, +month - 1, +day);
      const dateRange = new DateRange(date, weekStartDay);

      Object.keys(expectedResults).forEach((option) => {
        describe(`Date range option: ${option}`, () => {
          const expectedDates = expectedResults[option];
          const { startDate, endDate } = dateRange.getDates(dateRangeOptions[option]);

          test(`startDate should be ${expectedDates.startDate}`, () => {
            expect(startDate).toBe(expectedDates.startDate);
          });
          test(`endDate should be ${expectedDates.endDate}`, () => {
            expect(endDate).toBe(expectedDates.endDate);
          });
        });
      });
    });
  });
});
