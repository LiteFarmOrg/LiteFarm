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

import { groupBy as lodashGroupBy } from 'lodash-es';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import {
  ANIMAL_INVENTORY_ID,
  ANIMAL_SALE,
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
} from '../../components/Forms/RevenueForm/constants';
import { chooseIdentification } from '../Animals/utils';
import i18n from '../../locales/i18n';
import { getMass, getMassUnit, roundToTwoDecimal } from '../../util';
import { isSameDay } from '../../util/date-migrate-TS';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { LABOUR_ITEMS_GROUPING_OPTIONS } from './constants';
import { transactionTypeEnum } from './useTransactions';
import { parseInventoryId } from '../../util/animal';
import { AnimalOrBatchKeys } from '../Animals/types';

// Polyfill for tests and older browsers
const groupBy = typeof Object.groupBy === 'function' ? Object.groupBy : lodashGroupBy;

export function calcTotalLabour(transactions) {
  return Math.abs(
    transactions
      .filter((transaction) => transaction.transactionType === transactionTypeEnum.labourExpense)
      .reduce((sum, curTransaction) => sum + curTransaction.amount, 0),
  );
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

export function calcOtherExpense(transactions) {
  return Math.abs(
    transactions
      .filter((transaction) => transaction.transactionType === transactionTypeEnum.expense)
      .reduce((sum, curTransaction) => sum + curTransaction.amount, 0),
  );
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

export function calcActualRevenue(transactions) {
  return transactions
    .filter(
      ({ transactionType }) =>
        transactionType === transactionTypeEnum.revenue ||
        transactionType === transactionTypeEnum.cropRevenue,
    )
    .reduce((sum, curTransaction) => sum + curTransaction.amount, 0);
}

export function calcActualRevenueFromRevenueItems(revenueItems) {
  return revenueItems.reduce((sum, curItem) => sum + curItem.totalAmount, 0);
}

export const mapTasksToLabourItems = (tasks, taskTypes, users) => {
  const groupingOptions = [
    {
      key: 'assignee_user_id',
      label: LABOUR_ITEMS_GROUPING_OPTIONS.EMPLOYEE,
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
      label: LABOUR_ITEMS_GROUPING_OPTIONS.TASK_TYPE,
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
    const groupedTasks = groupBy(tasks, (task) => task[option.key]);
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
          time: roundToTwoDecimal(time),
          labourCost,
        },
        groupKey,
      );
    });
    labourItemGroups[option.label] = items;
  });

  return labourItemGroups;
};

export const mapSalesToRevenueItems = (
  sales,
  revenueTypes,
  cropVarieties,
  animals = [],
  animalBatches = [],
) => {
  const revenueItems = sales.map((sale) => {
    const revenueType = revenueTypes.find(
      (revenueType) => revenueType.revenue_type_id === sale.revenue_type_id,
    );
    if (revenueType?.entity_type === 'crop') {
      const quantityUnit = getMassUnit();
      const cropVarietySale = sale.crop_variety_sale;
      return {
        sale,
        totalAmount: cropVarietySale.reduce((total, sale) => total + sale.sale_value, 0),
        financeItemsProps: cropVarietySale
          .map((cvs) => {
            const convertedQuantity = roundToTwoDecimal(getMass(cvs.quantity).toString());
            const cropVariety = cropVarieties.find(
              (cropVariety) => cropVariety.crop_variety_id === cvs.crop_variety_id,
            );
            const cropVarietyName = cropVariety?.crop_variety_name;
            const cropTranslationKey = cropVariety?.crop.crop_translation_key;
            const title = cropVarietyName
              ? `${cropVarietyName}, ${i18n.t(`crop:${cropTranslationKey}`)}`
              : i18n.t(`crop:${cropTranslationKey}`);
            return {
              key: cvs.crop_variety_id,
              title,
              subtitle: `${convertedQuantity} ${quantityUnit}`,
              quantity: convertedQuantity,
              quantityUnit,
              amount: cvs.sale_value,
            };
          })
          .sort((a, b) => String(a.title).localeCompare(String(b.title))),
      };
    } else if (revenueType?.entity_type === 'animal') {
      const quantityUnit = getMassUnit();
      const animalSale = sale.animal_sale ?? [];
      return {
        sale,
        totalAmount: animalSale.reduce((total, row) => total + row.sale_value, 0),
        financeItemsProps: animalSale
          .map((row) => {
            const convertedQuantity = roundToTwoDecimal(getMass(row.quantity).toString());
            const matched =
              row.animal_id != null
                ? animals.find((a) => a.id === row.animal_id)
                : animalBatches.find((b) => b.id === row.animal_batch_id);
            const title = matched
              ? chooseIdentification(matched)
              : (row.animal_id ?? row.animal_batch_id);
            const key =
              row.animal_id != null ? `animal_${row.animal_id}` : `batch_${row.animal_batch_id}`;
            return {
              key,
              title,
              subtitle: `${convertedQuantity} ${quantityUnit}`,
              quantity: convertedQuantity,
              quantityUnit,
              amount: row.sale_value,
            };
          })
          .sort((a, b) => String(a.title).localeCompare(String(b.title))),
      };
    } else {
      return {
        sale,
        totalAmount: sale.value || 0,
        financeItemsProps: [
          {
            key: sale.sale_id,
            title: revenueType?.revenue_name,
            amount: sale.value || 0,
          },
        ],
      };
    }
  });

  return revenueItems;
};

export function mapRevenueTypesToReactSelectOptions(revenueTypes) {
  const { t } = useTranslation();
  return revenueTypes?.map((type) => {
    const retireSuffix = type.retired ? ` ${t('REVENUE.EDIT_REVENUE.RETIRED')}` : '';

    return {
      value: type.revenue_type_id,
      label: type.farm_id
        ? type.revenue_name + retireSuffix
        : t(`revenue:${type.revenue_translation_key}.REVENUE_NAME`),
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
  if (revenueType?.entity_type === 'crop') {
    sale.value = undefined;
    sale.crop_variety_sale = Object.values(data[CROP_VARIETY_SALE]).map((c) => {
      return {
        sale_value: c[SALE_VALUE],
        quantity: c[QUANTITY],
        quantity_unit: c[QUANTITY_UNIT].label,
        crop_variety_id: c[CROP_VARIETY_ID],
      };
    });
  } else if (revenueType?.entity_type === 'animal') {
    sale.value = undefined;
    sale.animal_sale = Object.values(data[ANIMAL_SALE]).map((a) => {
      const { kind, id } = parseInventoryId(a[ANIMAL_INVENTORY_ID]);
      const isBatch = kind === AnimalOrBatchKeys.BATCH;
      return {
        sale_value: a[SALE_VALUE],
        quantity: a[QUANTITY],
        quantity_unit: a[QUANTITY_UNIT].label,
        animal_id: isBatch ? null : id,
        animal_batch_id: isBatch ? id : null,
      };
    });
  } else {
    sale.crop_variety_sale = undefined;
    sale.value = data[VALUE];
  }
  return sale;
}

export const formatAmount = (amount, symbol) => {
  const sign = amount > 0 ? '+ ' : '- ';
  return `${amount ? sign : ''}${symbol}${Math.abs(amount).toFixed(2)}`;
};

export const formatTransactionDate = (date, language = getLanguageFromLocalStorage()) => {
  if (!date) {
    return '';
  }
  const dateObj = new Date(date);
  const today = new Date();
  if (isSameDay(dateObj, today)) {
    return i18n.t('common:TODAY');
  }
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (isSameDay(dateObj, yesterday)) {
    return i18n.t('common:YESTERDAY');
  }
  return new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(dateObj);
};

/**
 * Returns a function that constructs a searchable string of an expense type or a revenue type.
 *
 * @param {string} typeCategory - The category of the type ('expense' or 'revenue')
 * @returns {function} getSearchableString function that takes a type and returns a searchable string.
 */
export const getFinanceTypeSearchableStringFunc = (typeCategory) => (type) => {
  const nameKey = `${typeCategory}_name`;
  const translationKey = `${typeCategory}_translation_key`;
  const TYPE_CATEGORY = typeCategory.toUpperCase();

  const typeName = type.farm_id
    ? type[nameKey]
    : i18n.t(`${typeCategory}:${type[translationKey]}.${TYPE_CATEGORY}_NAME`);
  const description = type.farm_id
    ? type.custom_description
    : i18n.t(`${typeCategory}:${type[translationKey]}.CUSTOM_DESCRIPTION`);
  return [typeName, description].filter(Boolean).join(' ');
};

export const isCropSale = (revenueType) => revenueType?.entity_type === 'crop';
export const isAnimalSale = (revenueType) => revenueType?.entity_type === 'animal';

const transformCropAllocations = (allocations) => {
  return allocations
    ? allocations.map(({ id, allocated_value }) => {
        return { crop_variety_id: id, allocated_value };
      })
    : [];
};

const transformAnimalAllocations = (allocations) => {
  return allocations
    ? allocations.map(({ id, allocated_value }) => {
        const { kind, id: animalId } = parseInventoryId(id);
        const idKey = kind === AnimalOrBatchKeys.ANIMAL ? 'animal_id' : 'animal_batch_id';
        return { [idKey]: animalId, allocated_value };
      })
    : [];
};

export const transformExpenseAllocations = ({ allocations, entityType }) => {
  return {
    farm_expense_crop_variety: entityType === 'crop' ? transformCropAllocations(allocations) : [],
    farm_expense_animal: entityType === 'animal' ? transformAnimalAllocations(allocations) : [],
  };
};

export const getNoOptionsMessage = (entity) => {
  return () =>
    entity === 'crop'
      ? i18n.t('SELECT.NO_ACTIVE_CROP_PLANS')
      : i18n.t('SELECT.NO_ANIMALS_IN_INVENTORY');
};
