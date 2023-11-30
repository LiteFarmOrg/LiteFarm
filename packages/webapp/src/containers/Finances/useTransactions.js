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

import { groupBy as lodashGroupBy } from 'lodash-es';
import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetNonRetiredExpenseTypesQuery } from '../../hooks/api/expenseTypesQueries';
import { useGetNonRetiredRevenueTypesQuery } from '../../hooks/api/revenueTypesQueries';
import useQueries from '../../hooks/api/useQueries';
import i18n from '../../locales/i18n';
import {
  useGetCropVarietiesQuery,
  useGetCropsQuery,
  useGetExpensesQuery,
  useGetSalesQuery,
  useGetTaskTypesQuery,
  useGetTasksQuery,
} from '../../store/api/apiSlice';
import { roundToTwoDecimal } from '../../util';
import { getComparator } from '../../util/sort';
import { loginSelector, userFarmsByFarmSelector } from '../userFarmSlice';
import { LABOUR_ITEMS_GROUPING_OPTIONS } from './constants';
import { mapSalesToRevenueItems, mapTasksToLabourItems } from './util';

export const transactionTypeEnum = {
  expense: 'EXPENSE',
  labourExpense: 'LABOUR_EXPENSE',
  revenue: 'REVENUE',
  cropRevenue: 'CROP_REVENUE',
};

// Polyfill for tests and older browsers
const groupBy = typeof Object.groupBy === 'function' ? Object.groupBy : lodashGroupBy;

const buildLabourTransactionsFromTasks = ({
  tasks,
  taskTypes,
  users,
  dateFilter,
  expenseTypeFilter,
}) => {
  const filteredTasks = tasks
    .map((task) => ({ ...task, date: task.complete_date ?? task.abandon_date }))
    .filter(
      (task) =>
        task.duration &&
        (!dateFilter ||
          (moment(task.date).isSameOrAfter(dateFilter.startDate, 'day') &&
            moment(task.date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
        // We don't have an actual Labour expense type, but we allow to filter by it in the Expense types filter.
        (!expenseTypeFilter || expenseTypeFilter[transactionTypeEnum.labourExpense]?.active),
    );

  // We only want to show one Labour transaction per day. When expanding the item details on how that transaction was summed up from tasks will be displayed.
  const groupedTasks = groupBy(filteredTasks, ({ date }) => date);
  const groupedTransactions = [];

  Object.keys(groupedTasks).forEach((date) => {
    const labourItems = mapTasksToLabourItems(groupedTasks[date], taskTypes, users);
    const amount = labourItems[LABOUR_ITEMS_GROUPING_OPTIONS.EMPLOYEE].reduce(
      (sum, task) => sum + task.labourCost,
      0,
    );
    if (amount > 0) {
      groupedTransactions.push({
        icon: 'LABOUR',
        date,
        transactionType: transactionTypeEnum.labourExpense,
        typeLabel: i18n.t('SALE.FINANCES.LABOUR_LABEL'),
        amount: -amount,
        note: i18n.t('FINANCES.TRANSACTION.LABOUR_EXPENSE'),
        items: labourItems,
      });
    }
  });

  return groupedTransactions;
};

const getExpenseTypeLabel = (expenseType) => {
  if (!expenseType) {
    return '';
  }
  return expenseType?.farm_id
    ? expenseType?.expense_name
    : i18n.t(`expense:${expenseType?.expense_translation_key}.EXPENSE_NAME`);
};

const getRevenueTypeLabel = (revenueType) => {
  if (!revenueType) {
    return '';
  }
  return revenueType?.farm_id
    ? revenueType?.revenue_name
    : i18n.t(`revenue:${revenueType?.revenue_translation_key}.REVENUE_NAME`);
};

const buildExpenseTransactions = ({ expenses, expenseTypes, dateFilter, expenseTypeFilter }) => {
  return expenses
    .filter(
      (expense) =>
        (!dateFilter ||
          (moment(expense.expense_date).isSameOrAfter(dateFilter.startDate, 'day') &&
            moment(expense.expense_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
        (!expenseTypeFilter || expenseTypeFilter[expense.expense_type_id]?.active),
    )
    .map((expense) => {
      const expenseType = expenseTypes.find(
        (expenseType) => expenseType?.expense_type_id === expense.expense_type_id,
      );
      return {
        icon: expenseType?.farm_id ? 'CUSTOM' : expenseType?.expense_translation_key,
        date: expense.expense_date,
        transactionType: transactionTypeEnum.expense,
        typeLabel: getExpenseTypeLabel(expenseType),
        amount: -roundToTwoDecimal(expense.value),
        note: expense.note,
        relatedId: expense.farm_expense_id,
      };
    });
};

const buildRevenueTransactions = ({
  sales,
  revenueTypes,
  cropVarieties,
  crops,
  dateFilter,
  revenueTypeFilter,
}) => {
  const filteredSales = sales.filter(
    (sale) =>
      (!dateFilter ||
        (moment(sale.sale_date).isSameOrAfter(dateFilter.startDate, 'day') &&
          moment(sale.sale_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
      (!revenueTypeFilter || revenueTypeFilter[sale.revenue_type_id]?.active),
  );
  const revenueItems = mapSalesToRevenueItems(filteredSales, revenueTypes, cropVarieties, crops);

  return revenueItems.map((item) => {
    const revenueType = revenueTypes.find(
      (revenueType) => revenueType?.revenue_type_id == item.sale.revenue_type_id,
    );
    return {
      icon: revenueType?.farm_id ? 'CUSTOM' : revenueType?.revenue_translation_key,
      date: item.sale.sale_date,
      transactionType: revenueType?.crop_generated
        ? transactionTypeEnum.cropRevenue
        : transactionTypeEnum.revenue,
      typeLabel: getRevenueTypeLabel(revenueType),
      amount: item.totalAmount,
      note: item.sale.customer_name,
      items: item.financeItemsProps,
      relatedId: item.sale.sale_id,
    };
  });
};

export const buildTransactions = ({
  sales = [],
  tasks = [],
  expenses = [],
  expenseTypes = [],
  revenueTypes = [],
  taskTypes = [],
  cropVarieties = [],
  crops = [],
  users = [],
  dateFilter,
  expenseTypeFilter,
  revenueTypeFilter,
}) => {
  const transactions = [
    ...buildLabourTransactionsFromTasks({
      tasks,
      taskTypes,
      users,
      dateFilter,
      expenseTypeFilter,
    }),
    ...buildExpenseTransactions({ expenses, expenseTypes, dateFilter, expenseTypeFilter }),
    ...buildRevenueTransactions({
      sales,
      revenueTypes,
      cropVarieties,
      crops,
      dateFilter,
      revenueTypeFilter,
    }),
  ];

  const sortedTransactions = transactions.sort(getComparator('desc', 'date'));

  return sortedTransactions;
};

const useTransactions = ({ dateFilter, expenseTypeFilter, revenueTypeFilter }) => {
  const { farm_id } = useSelector(loginSelector);
  const users = useSelector(userFarmsByFarmSelector);

  const queries = useMemo(
    () => [
      { hook: useGetSalesQuery, label: 'sales', params: farm_id },
      { hook: useGetExpensesQuery, label: 'expenses', params: farm_id },
      { hook: useGetNonRetiredExpenseTypesQuery, label: 'expenseTypes', params: farm_id },
      { hook: useGetNonRetiredRevenueTypesQuery, label: 'revenueTypes', params: farm_id },
      { hook: useGetTasksQuery, label: 'tasks', params: farm_id },
      { hook: useGetTaskTypesQuery, label: 'taskTypes', params: farm_id },
      { hook: useGetCropVarietiesQuery, label: 'cropVarieties', params: farm_id },
      { hook: useGetCropsQuery, label: 'crops', params: farm_id },
    ],
    [],
  );

  const { data, isLoading } = useQueries(queries);
  const { expenseTypes, revenueTypes } = data;

  const transactions = useMemo(() => {
    if (!expenseTypes?.length || !revenueTypes?.length) {
      return [];
    }

    return buildTransactions({
      ...data,
      users,
      dateFilter,
      expenseTypeFilter,
      revenueTypeFilter,
    });
  }, [data, users, buildTransactions, dateFilter, expenseTypeFilter, revenueTypeFilter]);

  return { transactions, isLoading };
};

export default useTransactions;
