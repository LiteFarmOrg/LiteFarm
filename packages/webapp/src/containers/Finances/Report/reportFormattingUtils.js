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

export const generateReportHeaders = (t) => {
  return {
    note: t('FINANCES.REPORT.TRANSACTION'),
    typeLabel: t('common:TYPE'),
    date: t('common:DATE'),
    amount: t('common:AMOUNT'),
  };
};

export const generateConfigSheetHeaders = (t) => ({
  farm: t('PROFILE.FARM.FARM_NAME'),
  dates: t('FINANCES.REPORT.DATES'),
  expenseTypes: t('FINANCES.FILTER.EXPENSE_TYPE'),
  revenueTypes: t('FINANCES.FILTER.REVENUE_TYPE'),
});

export const generateWorksheetTitles = (t) => ({
  TRANSACTIONS: t('FINANCES.REPORT.TRANSACTIONS'),
  EXPORT_SETTINGS: t('FINANCES.REPORT.SETTINGS'),
});

export const formatTransactions = (transactions, t) =>
  transactions.map((item) => ({
    note: item.note || t('FINANCES.TRANSACTION.LABOUR_EXPENSE'),
    typeLabel: item.typeLabel || t('SALE.FINANCES.LABOUR_LABEL'),
    date: new Date(item.date),
    amount: item.amount,
  }));

/**
 * Constructs a sorted filter object for given types (either expense or revenue).
 *
 * @param {Array} types - Array of type objects
 * @param {Function} translate - Translation function from i18next-react
 * @param {string} typeCategory - The category of the type ('expense' or 'revenue')
 * @returns {Object} Filter object with type ids as keys and {active, label} as values.
 */
export const createDefaultTypeFilter = ({ types, translate, typeCategory }) => {
  const typeIdKey = `${typeCategory}_type_id`;
  const nameKey = `${typeCategory}_name`;
  const translationKey = `${typeCategory}_translation_key`;
  const retiredKey = `${typeCategory}_RETIRED`;
  const TYPE_CATEGORY = typeCategory.toUpperCase();

  const filterObject = types.reduce(
    (filterObject, type) => ({
      ...filterObject,
      [type[typeIdKey]]: {
        active: true,
        label:
          (type.farm_id
            ? type[nameKey]
            : translate(`${typeCategory}:${type[translationKey]}.${TYPE_CATEGORY}_NAME`)) +
          (type.retired ? ` ${translate(`${TYPE_CATEGORY}.EDIT_${TYPE_CATEGORY}.RETIRED`)}` : ''),
      },
    }),
    {},
  );

  // Add LABOUR at the end if typeCategory is 'expense'
  if (typeCategory === 'expense') {
    filterObject['LABOUR'] = { active: true, label: translate('SALE.FINANCES.LABOUR_LABEL') };
  }

  // Sort the config object by label
  const sortedFilterObject = Object.fromEntries(
    Object.entries(filterObject).sort((a, b) => a[1].label.localeCompare(b[1].label)),
  );

  return sortedFilterObject;
};
