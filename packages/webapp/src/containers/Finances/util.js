/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import moment from 'moment';
import { roundToTwoDecimal } from '../../util';
import { revenueFormTypes } from './constants';

export function calcTotalLabour(tasks, startDate, endDate) {
  let total = 0.0;
  if (Array.isArray(tasks)) {
    for (const t of tasks) {
      const completedTime = moment(t.complete_date);
      const abandonedTime = moment(t.abandon_date);
      if (
        (completedTime.isSameOrAfter(startDate, 'day') &&
          completedTime.isSameOrBefore(endDate, 'day') &&
          t.duration) ||
        (abandonedTime.isSameOrAfter(startDate, 'day') &&
          abandonedTime.isSameOrBefore(endDate, 'day') &&
          t.duration)
      ) {
        // TODO: possibly implement check when wage can be yearly
        // if (s.wage.type === 'hourly')
        const rate = roundToTwoDecimal(t.wage_at_moment);
        const hoursWorked = roundToTwoDecimal(t.duration / 60);
        total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(rate * hoursWorked));
      }
    }
  }
  return total;
}

export const sortByDate = (data) => {
  return data.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.date) - new Date(a.date);
  });
};

export const filterSalesByCurrentYear = (sales) => {
  return sales.filter((s) => {
    const saleYear = new Date(s.sale_date).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear === saleYear;
  });
};

export function calcOtherExpense(expenses, startDate, endDate) {
  let total = 0.0;
  if (Array.isArray(expenses)) {
    for (const e of expenses) {
      const expenseDate = moment(e.expense_date);
      if (
        expenseDate.isSameOrAfter(startDate, 'day') &&
        expenseDate.isSameOrBefore(endDate, 'day')
      ) {
        total = roundToTwoDecimal(total + roundToTwoDecimal(e.value));
      }
    }
  }
  return total;
}

export function filterSalesByDateRange(sales, startDate, endDate) {
  if (sales && Array.isArray(sales)) {
    return sales.filter((s) => {
      const saleDate = moment(s.sale_date);
      return saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day');
    });
  }
  return [];
}

export function calcActualRevenue(sales, startDate, endDate) {
  let total = 0.0;

  if (sales && Array.isArray(sales)) {
    for (const s of sales) {
      const saleDate = moment(s.sale_date);
      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        for (const c of s.crop_variety_sale) {
          total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(c.sale_value));
        }
      }
    }
  }
  return total;
}

export const getRevenueFormType = (revenueType) => {
  // TODO: LF-3595 - properly determine the form type
  return revenueType?.farm_id ? revenueFormTypes.GENERAL : revenueFormTypes.CROP_SALE;
};
