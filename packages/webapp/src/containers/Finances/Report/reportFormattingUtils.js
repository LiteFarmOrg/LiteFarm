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
