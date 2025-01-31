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

import i18n from '../locales/i18n';

interface Age {
  years: number;
  months: number;
  days: number;
  /**
   * Used in fractional month values (e.g., 1.7m)
   * to calculate the proportion of the month that has passed.
   * May equal the days in the previous month or the current month.
   */
  daysInCalculationMonth: number;
}

/**
 * Calculates the age in years, months, and days from the birth date
 * to the current date.
 *
 * @param birth - The birth date.
 * @param today - The current date (optional).
 * @returns The calculated age.
 * @throws Error - If the current date is before the birth date.
 */
export const calculateAge = (birth: Date, today: Date = new Date()): Age => {
  if (today < birth) {
    throw new Error('The currentDate must be on or after the birthDate.');
  }

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();

  // Determine if an adjustment is needed based on the birth date and current date.
  // For example, when today is 2024-10-15 and the birth date is 2024-08-31, an adjustment
  // is needed because the birth day of month did not occur in the previous month.
  const needsAdjustment =
    today.getDate() - birth.getDate() < 0 && daysInPreviousMonth < birth.getDate();

  // Adjust the birth date to account for the previous month if necessary.
  const adjustedBirthDate = needsAdjustment ? daysInPreviousMonth : birth.getDate();

  let days = today.getDate() - adjustedBirthDate;

  // If the birth day hasn't occurred yet this month, adjust days and months.
  if (days < 0) {
    days += daysInPreviousMonth;
    months -= 1;
  }

  // If the birth month hasn't occurred yet this year, adjust months and years.
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const daysInThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const daysInCalculationMonth =
    today.getDate() - birth.getDate() >= 0 ? daysInThisMonth : daysInPreviousMonth;

  return { years, months, days, daysInCalculationMonth };
};

export const formatAge = ({ years, months, days, daysInCalculationMonth }: Age): string => {
  if (!years && !months) {
    return i18n.t('common:AGE_DAYS_COUNT', { count: days });
  }

  if (!years) {
    const formattedMonths = Math.round((months + days / daysInCalculationMonth) * 10) / 10;

    if (formattedMonths === 12) {
      return i18n.t('common:AGE_YEARS_COUNT', { count: 1 });
    }

    return i18n.t('common:AGE_MONTHS_COUNT', { count: formattedMonths });
  }

  const formattedYears = Math.round((years + months / 12) * 10) / 10;
  return i18n.t('common:AGE_YEARS_COUNT', { count: formattedYears });
};

export const getAge = (birthDate: Date): string => {
  return formatAge(calculateAge(birthDate));
};
