/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { groupBy as lodashGroupBy } from 'lodash';
import { expenseSelector, salesSelector, allExpenseTypeSelector } from './selectors';
import { tasksSelector } from '../taskSlice';
import { taskTypesSelector } from '../taskTypeSlice';
import { allRevenueTypesSelector } from '../revenueTypeSlice';
import { userFarmsByFarmSelector } from '../userFarmSlice';
import { roundToTwoDecimal } from '../../util';
import { cropVarietiesSelector } from '../cropVarietySlice';
import { mapSalesToRevenueItems, mapTasksToLabourItems } from './util';
import i18n from '../../locales/i18n';
import { LABOUR_ITEMS_GROUPING_OPTIONS } from './constants';

const transactionTypeEnum = {
  expense: 'EXPENSE',
  labourExpense: 'LABOUR_EXPENSE',
  revenue: 'REVENUE',
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
        expenseTypeFilter?.includes(transactionTypeEnum.labourExpense),
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
        date,
        transactionType: transactionTypeEnum.labourExpense,
        amount: -amount,
        items: labourItems,
      });
    }
  });

  return groupedTransactions;
};

const buildExpenseTransactions = ({ expenses, expenseTypes, dateFilter, expenseTypeFilter }) => {
  return expenses
    .filter(
      (expense) =>
        (!dateFilter ||
          (moment(expense.expense_date).isSameOrAfter(dateFilter.startDate, 'day') &&
            moment(expense.expense_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
        expenseTypeFilter?.includes(expense.expense_type_id) &&
        expense.value > 0,
    )
    .map((expense) => {
      const expenseType = expenseTypes.find(
        (expenseType) => expenseType.expense_type_id === expense.expense_type_id,
      );
      return {
        icon: expenseType?.farm_id ? 'OTHER' : expenseType?.expense_translation_key,
        date: expense.expense_date,
        transactionType: transactionTypeEnum.expense,
        typeLabel: expenseType?.farm_id
          ? expenseType?.expense_name
          : i18n.t(`expense:${expenseType?.expense_translation_key}`),
        amount: -roundToTwoDecimal(expense.value),
        note: expense.note,
      };
    });
};

const buildRevenueTransactions = ({
  sales,
  revenueTypes,
  cropVarieties,
  dateFilter,
  revenueTypeFilter,
}) => {
  const filteredSales = sales.filter(
    (sale) =>
      (!dateFilter ||
        (moment(sale.sale_date).isSameOrAfter(dateFilter.startDate, 'day') &&
          moment(sale.sale_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
      revenueTypeFilter?.includes(sale.revenue_type_id),
  );

  // We only want to show one revenue transaction per type per day. When expanding the item details on how that transaction was summed up from tasks will be displayed.
  const groupedByRevenueTypeSales = groupBy(
    filteredSales,
    ({ revenue_type_id }) => revenue_type_id,
  );
  const groupedTransactions = [];

  Object.keys(groupedByRevenueTypeSales).forEach((revenueTypeId) => {
    const groupedByDateSales = groupBy(
      groupedByRevenueTypeSales[revenueTypeId],
      ({ sale_date }) => sale_date,
    );
    const revenueType = revenueTypes.find(
      (revenueType) => revenueType.revenue_type_id == revenueTypeId,
    );

    Object.keys(groupedByDateSales).forEach((date) => {
      const revenueItems = mapSalesToRevenueItems(
        groupedByDateSales[date],
        revenueTypes,
        cropVarieties,
      );
      groupedTransactions.push({
        icon: revenueType?.farm_id ? 'OTHER' : revenueType?.revenue_translation_key,
        date,
        transactionType: transactionTypeEnum.revenue,
        typeLabel: revenueType?.farm_id
          ? revenueType?.revenue_name
          : i18n.t(`revenue:${revenueType?.revenue_translation_key}`),
        amount: revenueItems.reduce((sum, item) => sum + item.totalAmount, 0),
        items: revenueItems,
      });
    });
  });

  return groupedTransactions;
};

export const buildTransactions = ({
  sales,
  tasks,
  expenses,
  expenseTypes,
  revenueTypes,
  taskTypes,
  cropVarieties,
  users,
  dateFilter,
  expenseTypeFilter,
  revenueTypeFilter,
}) => {
  const transactions = [
    ...buildLabourTransactionsFromTasks({ tasks, taskTypes, users, dateFilter, expenseTypeFilter }),
    ...buildExpenseTransactions({ expenses, expenseTypes, dateFilter, expenseTypeFilter }),
    ...buildRevenueTransactions({
      sales,
      revenueTypes,
      cropVarieties,
      dateFilter,
      revenueTypeFilter,
    }),
  ];

  const sortedTransactions = transactions.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  });

  return sortedTransactions;
};

const useTransactions = ({ dateFilter, expenseTypeFilter, revenueTypeFilter }) => {
  const sales = useSelector(salesSelector);
  const tasks = useSelector(tasksSelector);
  const expenses = useSelector(expenseSelector);
  const expenseTypes = useSelector(allExpenseTypeSelector);
  const revenueTypes = useSelector(allRevenueTypesSelector);
  const taskTypes = useSelector(taskTypesSelector);
  const cropVarieties = useSelector(cropVarietiesSelector);
  const users = useSelector(userFarmsByFarmSelector);

  const transactions = useMemo(
    () =>
      buildTransactions({
        sales,
        tasks,
        expenses,
        expenseTypes,
        revenueTypes,
        taskTypes,
        cropVarieties,
        users,
        dateFilter,
        expenseTypeFilter,
        revenueTypeFilter,
      }),
    [
      sales,
      tasks,
      expenses,
      expenseTypes,
      revenueTypes,
      taskTypes,
      cropVarieties,
      users,
      buildTransactions,
    ],
  );

  return transactions;
};

export default useTransactions;
