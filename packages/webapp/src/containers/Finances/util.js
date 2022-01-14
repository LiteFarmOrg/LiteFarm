/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (util.js) is part of LiteFarm.
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

export function calcTotalLabour(tasks, startDate, endDate) {
  let total = 0;
  if (Array.isArray(tasks)) {
    for (let t of tasks) {
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
        let rate = Number(t.wage_at_moment).toFixed(2);
        let hoursWorked = Number((t.duration / 60).toFixed(2));
        total += rate * hoursWorked;
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
  let total = 0;
  if (Array.isArray(expenses)) {
    for (let e of expenses) {
      const expenseDate = moment(e.expense_date);
      if (
        expenseDate.isSameOrAfter(startDate, 'day') &&
        expenseDate.isSameOrBefore(endDate, 'day')
      ) {
        total += Number(e.value);
      }
    }
  }
  total = total.toFixed(2);
  return total;
}

export function calcSales(sales, startDate, endDate) {
  let total = 0;

  if (Array.isArray(sales)) {
    for (let s of sales) {
      const saleDate = moment(s.sale_date);
      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        for (let c of s.cropSale) {
          total += Number(c.sale_value);
        }
      }
    }
  }
  total = total.toFixed(2);
  return total;
}

export function calcBalanceByCrop(shifts, sales, expenses, startDate, endDate) {
  let sortObj = {};
  let unAllocated = {};
  if (shifts && shifts.length) {
    for (let s of shifts) {
      let cid = s.crop_id;
      if (cid) {
        const shiftDate = moment(s.shift_date);
        if (shiftDate.isSameOrAfter(startDate, 'day') && shiftDate.isSameOrBefore(endDate, 'day')) {
          if (sortObj.hasOwnProperty(cid)) {
            sortObj[cid].cost += Number(s.wage_at_moment) * (s.duration / 60);
          } else {
            sortObj[cid] = {
              cost: Number(s.wage_at_moment) * (s.duration / 60),
              crop: s.crop_common_name,
              revenue: 0,
            };
          }
        }
      } else {
        if (s.location_id && s.is_field) {
          if (unAllocated.hasOwnProperty(s.location_id)) {
            unAllocated[s.location_id] += Number(Number(s.wage_at_moment) * (s.duration / 60));
          } else {
            unAllocated[s.location_id] = Number(Number(s.wage_at_moment) * (s.duration / 60));
          }
        }
      }
    }
  }

  let fieldKeys = Object.keys(unAllocated);

  for (let fk of fieldKeys) {
    let shiftCropOnField = getShiftCropOnField(fk, shifts);
    let isAllocated = false;
    if (shiftCropOnField.length) {
      let avgCost = unAllocated[fk] / shiftCropOnField.length;
      for (let c of shiftCropOnField) {
        if (sortObj.hasOwnProperty(c)) {
          isAllocated = true;
          sortObj[c].cost += avgCost;
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
    for(let fk of fieldKeys){
      sortObj['unallocated'].cost += unAllocated[fk];
    }
    this.setState({
      hasUnAllocated: true,
    })
  }
  */

  let keys = Object.keys(sortObj);
  let numOfCrops = keys.length;
  let expensePerCrop = Number(
    (Number(calcOtherExpense(expenses, startDate, endDate)) / numOfCrops).toFixed(2),
  );

  for (let k of keys) {
    sortObj[k].cost += Number(Number(expensePerCrop).toFixed(2));
  }

  if (sales && sales.length) {
    for (let s of sales) {
      const saleDate = moment(s.sale_date);
      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        for (let cropSale of s.cropSale) {
          let cid = cropSale.managementPlan.crop_id;
          if (sortObj.hasOwnProperty(cid)) {
            sortObj[cid].revenue += Number(Number(cropSale.sale_value).toFixed(2));
          } else {
            sortObj[cid] = {
              cost: 0,
              crop: cropSale.managementPlan.crop.crop_common_name,
              revenue: Number(Number(cropSale.sale_value).toFixed(2)),
            };
          }
        }
      }
    }
  }

  let final = [];
  keys = Object.keys(sortObj);
  for (let k of keys) {
    final.push({
      crop: sortObj[k].crop,
      profit: Number((Number(sortObj[k].revenue) - Number(sortObj[k].cost)).toFixed(2)),
    });
  }

  return final;
}

export function getShiftCropOnField(fieldID, shifts) {
  let crops = [];

  for (let s of shifts) {
    if (s.location_id === fieldID && s.crop_id) {
      crops.push(s.crop_id);
    }
  }

  return crops;
}
