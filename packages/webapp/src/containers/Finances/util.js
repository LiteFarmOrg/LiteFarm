/*
 *  Copyright 2019-2022 LiteFarm.org
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

export function calcTotalLabour(tasks, startDate, endDate) {
  let total = 0.00;
  if (Array.isArray(tasks)) {
    for (const t of tasks) {
      const completedTime = moment(t.completed_time);
      const abandonedTime = moment(t.abandoned_time);
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
        total = roundToTwoDecimal(total + roundToTwoDecimal(rate * hoursWorked));
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
  let total = 0.00;
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

export function calcSales(sales, startDate, endDate) {
  let total = 0.00;

  if (Array.isArray(sales)) {
    for (const s of sales) {
      const saleDate = moment(s.sale_date);
      if (
        saleDate.isSameOrAfter(startDate, 'day') &&
        saleDate.isSameOrBefore(endDate, 'day')
      ) {
        for (const c of s.cropSale) {
          total = roundToTwoDecimal(total + roundToTwoDecimal(c.sale_value));
        }
      }
    }
  }
  return total;
}

export function calcBalanceByCrop(shifts, sales, expenses, startDate, endDate) {
  const sortObj = {};
  const unAllocated = {};
  if (shifts && shifts.length) {
    for (const s of shifts) {
      const cid = s.crop_id;
      const cost = roundToTwoDecimal(roundToTwoDecimal(s.wage_at_moment) * roundToTwoDecimal(s.duration / 60));
      if (cid) {
        const shiftDate = moment(s.shift_date);
        if (
          shiftDate.isSameOrAfter(startDate, 'day') &&
          shiftDate.isSameOrBefore(endDate, 'day')
        ) {
          if (sortObj.hasOwnProperty(cid)) {
            sortObj[cid].cost = roundToTwoDecimal(sortObj[cid].cost + cost);
          } else {
            sortObj[cid] = {
              cost,
              crop: s.crop_common_name,
              revenue: 0,
            };
          }
        }
      } else {
        if (s.location_id && s.is_field) {
          if (unAllocated.hasOwnProperty(s.location_id)) {
            unAllocated[s.location_id] = roundToTwoDecimal(roundToTwoDecimal(unAllocated[s.location_id] + cost));
          } else {
            unAllocated[s.location_id] = cost;
          }
        }
      }
    }
  }

  const fieldKeys = Object.keys(unAllocated);

  for (const fk of fieldKeys) {
    const shiftCropOnField = getShiftCropOnField(fk, shifts);
    let isAllocated = false;
    if (shiftCropOnField.length) {
      const avgCost = roundToTwoDecimal(roundToTwoDecimal(unAllocated[fk]) / shiftCropOnField.length);
      for (const c of shiftCropOnField) {
        if (sortObj.hasOwnProperty(c)) {
          isAllocated = true;
          sortObj[c].cost = roundToTwoDecimal(sortObj[c].cost + avgCost);
        }
      }
    }
    if (isAllocated) {
      delete unAllocated[fk];
    }
  }

  // @TODO NEED TO FIX THIS PART LATER
  /*
  fieldKeys = Object.keys(unAllocated);
  if(fieldKeys.length){
    sortObj['unallocated'] = {
      cost: 0,
      crop: 'Unallocated*',
      revenue: 0,
    };
    for(const fk of fieldKeys){
      sortObj['unallocated'].cost = roundToTwoDecimal(roundToTwoDecimal(sortObj['unallocated'].cost + roundToTwoDecimal(unAllocated[fk])));
    }
    this.setState({
      hasUnAllocated: true,
    })
  }
  */

  let keys = Object.keys(sortObj);
  const numOfCrops = keys.length;
  const expensePerCrop = roundToTwoDecimal(calcOtherExpense(expenses, startDate, endDate) / numOfCrops);

  for (const k of keys) {
    sortObj[k].cost = roundToTwoDecimal(roundToTwoDecimal(sortObj[k].cost + expensePerCrop));
  }

  if (sales && sales.length) {
    for (const s of sales) {
      const saleDate = moment(s.sale_date);
      if (
        saleDate.isSameOrAfter(startDate, 'day') &&
        saleDate.isSameOrBefore(endDate, 'day')
      ) {
        for (const cropSale of s.cropSale) {
          const cid = cropSale.managementPlan.crop_id;
          const revenue = roundToTwoDecimal(cropSale.sale_value);
          if (sortObj.hasOwnProperty(cid)) {
            sortObj[cid].revenue = roundToTwoDecimal(sortObj[cid].revenue + revenue);
          } else {
            sortObj[cid] = {
              cost: 0,
              crop: cropSale.managementPlan.crop.crop_common_name,
              revenue,
            };
          }
        }
      }
    }
  }

  const final = [];
  keys = Object.keys(sortObj);
  for (const k of keys) {
    final.push({
      crop: sortObj[k].crop,
      profit: roundToTwoDecimal(sortObj[k].revenue - sortObj[k].cost),
    });
  }

  return final;
}

export function getShiftCropOnField(fieldID, shifts) {
  const crops = [];

  for (const s of shifts) {
    if (s.location_id === fieldID && s.crop_id) {
      crops.push(s.crop_id);
    }
  }

  return crops;
}
