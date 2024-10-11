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

export const calculateAge = (
  birthDate: string,
  currentDate?: string,
): { years: number; months: number } => {
  const today = currentDate ? new Date(currentDate) : new Date();
  const birth = new Date(birthDate);

  let ageInYears = today.getFullYear() - birth.getFullYear();
  let remainingMonths = today.getMonth() - birth.getMonth();

  // Adjust if the birthday hasn't occurred yet this year
  if (remainingMonths < 0) {
    ageInYears--;
    remainingMonths += 12;
  }

  return { years: ageInYears, months: remainingMonths };
};

export const getAge = (birthDate: string) => {
  const { years, months } = calculateAge(birthDate);

  if (!years) {
    return i18n.t('common:AGE_MONTHS_COUNT', { count: months });
  }

  const monthsInDecimal = Math.floor((months / 12) * 10) / 10;
  return i18n.t('common:AGE_YEARS_COUNT', { count: +years + +monthsInDecimal });
};
