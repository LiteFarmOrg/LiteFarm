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

import { expect, describe, test, vi } from 'vitest';
import { calculateAge, formatAge } from '../util/age';

const getDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
};

const generateAge = (years, months, days, daysBetweenBirthdays) => {
  return { years, months, days, daysBetweenBirthdays };
};

describe('ageUtils test', () => {
  describe('Age calculation tests', () => {
    test('Calculates age on exact birthday', () => {
      const birthDate = getDate('2000-01-01');
      expect(calculateAge(birthDate, getDate('2000-01-01'))).toEqual(generateAge(0, 0, 0, 31));
    });

    test('Calculates age one day after birth', () => {
      let birthDate = getDate('2000-01-01');
      expect(calculateAge(birthDate, getDate('2000-01-02'))).toEqual(generateAge(0, 0, 1, 31));

      birthDate = getDate('2024-09-30');
      expect(calculateAge(birthDate, getDate('2024-10-01'))).toEqual(generateAge(0, 0, 1, 30));
    });

    test('Calculates age on the same day across different months and years', () => {
      const birthDate = getDate('2023-01-15');
      expect(calculateAge(birthDate, getDate('2023-01-15'))).toEqual(generateAge(0, 0, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-02-15'))).toEqual(generateAge(0, 1, 0, 28));
      expect(calculateAge(birthDate, getDate('2023-03-15'))).toEqual(generateAge(0, 2, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-04-15'))).toEqual(generateAge(0, 3, 0, 30));
      expect(calculateAge(birthDate, getDate('2023-05-15'))).toEqual(generateAge(0, 4, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-06-15'))).toEqual(generateAge(0, 5, 0, 30));
      expect(calculateAge(birthDate, getDate('2023-07-15'))).toEqual(generateAge(0, 6, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-08-15'))).toEqual(generateAge(0, 7, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-09-15'))).toEqual(generateAge(0, 8, 0, 30));
      expect(calculateAge(birthDate, getDate('2023-10-15'))).toEqual(generateAge(0, 9, 0, 31));
      expect(calculateAge(birthDate, getDate('2023-11-15'))).toEqual(generateAge(0, 10, 0, 30));
      expect(calculateAge(birthDate, getDate('2023-12-15'))).toEqual(generateAge(0, 11, 0, 31));
      expect(calculateAge(birthDate, getDate('2024-01-15'))).toEqual(generateAge(1, 0, 0, 31));
      expect(calculateAge(birthDate, getDate('2024-02-15'))).toEqual(generateAge(1, 1, 0, 29));
      expect(calculateAge(birthDate, getDate('2024-03-15'))).toEqual(generateAge(1, 2, 0, 31));
      expect(calculateAge(birthDate, getDate('2024-04-15'))).toEqual(generateAge(1, 3, 0, 30));
      expect(calculateAge(birthDate, getDate('2048-01-15'))).toEqual(generateAge(25, 0, 0, 31));
    });

    test('Handles month adjustment when birthday has not occurred this year', () => {
      const birthDate = getDate('2023-08-15');
      expect(calculateAge(birthDate, getDate('2024-02-14'))).toEqual(generateAge(0, 5, 30, 31));
    });

    test('Correctly adjusts months when day difference is negative', () => {
      const birthDate = getDate('2023-09-30');
      expect(calculateAge(birthDate, getDate('2024-10-01'))).toEqual(generateAge(1, 0, 1, 30));
    });

    test('Calculates age for birthday on the last day of a month', () => {
      const birthDate = getDate('2020-01-31');
      expect(calculateAge(birthDate, getDate('2021-01-30'))).toEqual(generateAge(0, 11, 30, 31));
      expect(calculateAge(birthDate, getDate('2021-02-01'))).toEqual(generateAge(1, 0, 1, 31));
    });

    test('Calculates age for birthday on the last day of a year', () => {
      const birthDate = getDate('2022-12-31');
      expect(calculateAge(birthDate, getDate('2024-01-01'))).toEqual(generateAge(1, 0, 1, 31));
    });

    test('Calculates age one day before birthday', () => {
      const birthDate = getDate('2024-10-15');
      expect(calculateAge(birthDate, getDate('2025-10-14'))).toEqual(generateAge(0, 11, 29, 30));
      expect(calculateAge(birthDate, getDate('2026-10-14'))).toEqual(generateAge(1, 11, 29, 30));
    });

    test('Calculates age for leap day birthday in leap year', () => {
      const birthDate = getDate('2020-02-29');
      expect(calculateAge(birthDate, birthDate)).toEqual(generateAge(0, 0, 0, 29));
      expect(calculateAge(birthDate, getDate('2020-03-01'))).toEqual(generateAge(0, 0, 1, 29));
      expect(calculateAge(birthDate, getDate('2024-02-29'))).toEqual(generateAge(4, 0, 0, 29));
    });

    test('Calculates age for leap day birthday in non-leap year', () => {
      const birthDate = getDate('2020-02-29');
      expect(calculateAge(birthDate, getDate('2021-02-28'))).toEqual(generateAge(0, 11, 30, 31));
      expect(calculateAge(birthDate, getDate('2021-03-01'))).toEqual(generateAge(1, 0, 1, 28));
    });

    test('Calculates age when current date is leap day', () => {
      const currentDate = getDate('2024-02-29');
      expect(calculateAge(getDate('2020-02-29'), currentDate)).toEqual(generateAge(4, 0, 0, 29));
      expect(calculateAge(getDate('2023-08-31'), currentDate)).toEqual(generateAge(0, 5, 29, 31));
    });

    test('Calculates age with current date in a leap year', () => {
      const birthDate = getDate('2023-08-15');
      expect(calculateAge(birthDate, getDate('2024-03-14'))).toEqual(generateAge(0, 6, 28, 29));
    });

    test('Calculates age in March during leap and non-leap years', () => {
      const birthDate = getDate('2023-08-15');
      // Leap year case
      expect(calculateAge(birthDate, getDate('2024-03-14'))).toEqual(generateAge(0, 6, 28, 29));
      // Non-leap year case
      expect(calculateAge(birthDate, getDate('2025-03-14'))).toEqual(generateAge(1, 6, 27, 28));
    });

    test('Throws error if current date is earlier than birth date', () => {
      const birthDate = getDate('2024-01-01');
      expect(() => calculateAge(birthDate, getDate('2023-12-31'))).toThrowError(
        'The currentDate must be on or after the birthDate.',
      );
    });
  });

  describe('Format age tests', () => {
    vi.mock('../locales/i18n', () => {
      return {
        default: {
          t: vi.fn((key, { count }) => {
            return {
              'common:AGE_YEARS_COUNT': `${count}y`,
              'common:AGE_MONTHS_COUNT': `${count}m`,
              'common:AGE_DAYS_COUNT': `${count}d`,
            }[key];
          }),
        },
      };
    });

    test('Calculates days age', () => {
      expect(formatAge(generateAge(0, 0, 0))).toEqual('0d');
      expect(formatAge(generateAge(0, 0, 1))).toEqual('1d');
      expect(formatAge(generateAge(0, 0, 31))).toEqual('31d');
    });

    test('Calculates months age', () => {
      expect(formatAge(generateAge(0, 1, 0, 30))).toEqual('1m');
      expect(formatAge(generateAge(0, 1, 1, 30))).toEqual('1m');
      expect(formatAge(generateAge(0, 1, 5, 28))).toEqual('1.2m');
      expect(formatAge(generateAge(0, 2, 10, 28))).toEqual('2.4m');
      expect(formatAge(generateAge(0, 3, 15, 29))).toEqual('3.5m');
      expect(formatAge(generateAge(0, 3, 15, 30))).toEqual('3.5m');
      expect(formatAge(generateAge(0, 4, 20, 30))).toEqual('4.7m');
      expect(formatAge(generateAge(0, 5, 25, 31))).toEqual('5.8m');
      expect(formatAge(generateAge(0, 11, 30, 31))).toEqual('1y');
    });

    test('Calculates years age', () => {
      expect(formatAge(generateAge(1, 0, 0))).toEqual('1y');
      expect(formatAge(generateAge(2, 1, 1))).toEqual('2.1y');
      expect(formatAge(generateAge(3, 2, 10))).toEqual('3.2y');
      expect(formatAge(generateAge(4, 3, 15))).toEqual('4.3y');
      expect(formatAge(generateAge(5, 4, 20))).toEqual('5.3y');
      expect(formatAge(generateAge(6, 5, 25))).toEqual('6.4y');
      expect(formatAge(generateAge(7, 6, 30))).toEqual('7.5y');
      expect(formatAge(generateAge(8, 11, 5))).toEqual('8.9y');
    });
  });
});
