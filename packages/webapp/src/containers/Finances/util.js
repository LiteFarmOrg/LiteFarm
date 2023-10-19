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
import { getMass, getMassUnit, roundToTwoDecimal } from '../../util';
import { revenueFormTypes } from './constants';
import i18n from '../../locales/i18n';

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
      const formType = getRevenueFormType(revenueType);

      const saleDate = moment(s.sale_date);
      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        if (formType === revenueFormTypes.CROP_SALE) {
          for (const c of s.crop_variety_sale) {
            total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(c.sale_value));
          }
        } else if (formType === revenueFormTypes.GENERAL) {
          total = roundToTwoDecimal(roundToTwoDecimal(total) + roundToTwoDecimal(s.value));
        }
      }
    }
  }
  return total;
}

export const getRevenueFormType = (revenueType) => {
  return revenueType?.crop_generated ? revenueFormTypes.CROP_SALE : revenueFormTypes.GENERAL;
};

export const mapTasksToLabourItems = (tasks, taskTypes, users) => {
  const groupingOptions = [
    {
      key: 'assignee_user_id',
      label: 'tasksByEmployee',
      taskObject: (task, groupKey) => {
        const assignee = users.find((user) => user.user_id == groupKey);
        return {
          ...task,
          employee: `${assignee.first_name} ${assignee.last_name.substring(0, 1).toUpperCase()}.`,
        };
      },
    },
    {
      key: 'task_type_id',
      label: 'tasksByTaskType',
      taskObject: (task, groupKey) => {
        const taskType = taskTypes.find((taskType) => taskType.task_type_id == groupKey);
        return {
          ...task,
          taskType: i18n.t(`task:${taskType.task_translation_key}`),
        };
      },
    },
  ];
  const labourItemGroups = {};
  groupingOptions.forEach((option) => {
    const groupedTasks = Object.groupBy(tasks, (task) => task[option.key]);
    const items = Object.keys(groupedTasks).map((groupKey) => {
      const tasksInGroup = groupedTasks[groupKey].map((task) => {
        const minutes = parseInt(task.duration, 10);
        const hours = roundToTwoDecimal(minutes / 60);
        const rate = roundToTwoDecimal(task.wage_at_moment);
        const labourCost = roundToTwoDecimal(rate * hours);
        return {
          ...task,
          time: hours,
          labourCost,
        };
      });
      const time = tasksInGroup.reduce((sum, task) => sum + task.time, 0);
      const labourCost = tasksInGroup.reduce((sum, task) => sum + task.labourCost, 0);

      return option.taskObject(
        {
          time,
          labourCost,
        },
        groupKey,
      );
    });
    labourItemGroups[option.label] = items;
  });

  return labourItemGroups;
};

export const mapSalesToRevenueItems = (sales, revenueTypes, cropVarieties) => {
  const revenueItems = sales.map((sale) => {
    const revenueType = revenueTypes.find(
      (revenueType) => revenueType.revenue_type_id === sale.revenue_type_id,
    );
    if (getRevenueFormType(revenueType) === revenueFormTypes.CROP_SALE) {
      const quantityUnit = getMassUnit();
      const cropVarietySale = sale.crop_variety_sale;
      return {
        sale,
        totalAmount: cropVarietySale.reduce((total, sale) => total + sale.sale_value, 0),
        financeItemsProps: cropVarietySale.map((cvs) => {
          const convertedQuantity = roundToTwoDecimal(getMass(cvs.quantity).toString());
          const {
            crop_variety_name: cropVarietyName,
            crop: { crop_translation_key },
          } = cropVarieties.find(
            (cropVariety) => cropVariety.crop_variety_id === cvs.crop_variety_id,
          );
          const title = cropVarietyName
            ? `${cropVarietyName}, ${i18n.t(`crop:${crop_translation_key}`)}`
            : i18n.t(`crop:${crop_translation_key}`);
          return {
            key: cvs.crop_variety_id,
            title,
            subtitle: `${convertedQuantity} ${quantityUnit}`,
            amount: cvs.sale_value,
          };
        }),
      };
    } else {
      return {
        sale,
        totalAmount: sale.value || 0,
        financeItemsProps: [
          {
            key: sale.sale_id,
            title: revenueType.revenue_name,
            amount: sale.value || 0,
          },
        ],
      };
    }
  });

  return revenueItems;
};
