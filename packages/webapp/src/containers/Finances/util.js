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
import { useTranslation } from 'react-i18next';
import {
  CROP_VARIETY_ID,
  CROP_VARIETY_SALE,
  CUSTOMER_NAME,
  NOTE,
  QUANTITY,
  QUANTITY_UNIT,
  REVENUE_TYPE_OPTION,
  SALE_DATE,
  SALE_VALUE,
  VALUE,
} from '../../components/Forms/GeneralRevenue/constants';

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

export function calcActualRevenue(sales, startDate, endDate, revenueTypes) {
  let total = 0.0;
  const revenueTypesMap = {};

  if (sales && Array.isArray(sales)) {
    for (const s of sales) {
      if (!revenueTypesMap[s.revenue_type_id]) {
        revenueTypesMap[s.revenue_type_id] = revenueTypes.find(
          ({ revenue_type_id }) => revenue_type_id === s.revenue_type_id,
        );
      }
      const revenueType = revenueTypesMap[s.revenue_type_id];
      const saleDate = moment(s.sale_date);
      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        if (revenueType?.crop_generated) {
          for (const c of s.crop_variety_sale) {
            total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(c.sale_value));
          }
        } else {
          total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(s.value));
        }
      }
    }
  }
  return total;
}

export function mapRevenueTypesToReactSelectOptions(revenueTypes) {
  const { t } = useTranslation();
  return revenueTypes?.map((type) => {
    const retireSuffix = type.deleted ? ` ${t('REVENUE.EDIT_REVENUE.RETIRED')}` : '';

    return {
      value: type.revenue_type_id,
      label: type.farm_id
        ? type.revenue_name + retireSuffix
        : t(`revenue:${type.revenue_translation_key}`),
    };
  });
}

export function mapRevenueFormDataToApiCallFormat(data, revenueTypes, sale_id, farm_id) {
  let sale = {
    sale_id: sale_id ?? undefined,
    farm_id: farm_id ?? undefined,
    customer_name: data[CUSTOMER_NAME],
    sale_date: data[SALE_DATE],
    revenue_type_id: data[REVENUE_TYPE_OPTION].value,
    note: data.note ? data[NOTE] : null,
  };
  const revenueType = revenueTypes.find(
    (type) => type.revenue_type_id === data[REVENUE_TYPE_OPTION].value,
  );
  if (revenueType.crop_generated) {
    sale.value = undefined;
    sale.crop_variety_sale = Object.values(data[CROP_VARIETY_SALE]).map((c) => {
      return {
        sale_value: c[SALE_VALUE],
        quantity: c[QUANTITY],
        quantity_unit: c[QUANTITY_UNIT].label,
        crop_variety_id: c[CROP_VARIETY_ID],
      };
    });
  } else {
    sale.crop_variety_sale = undefined;
    sale.value = data[VALUE];
  }
  return sale;
}
