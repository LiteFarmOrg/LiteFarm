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

import { useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { expenseSelector, salesSelector, expenseTypeByIdSelector } from './selectors';
import { tasksSelector } from '../taskSlice';
import { taskTypeSelector } from '../taskTypeSlice';
import { revenueTypeSelector } from '../revenueTypeSlice';
import { userFarmsByFarmSelector } from '../userFarmSlice';
import { roundToTwoDecimal, getMass } from '../../util';
import { cropVarietySelector } from '../cropVarietySlice';

const transactionTypeEnum = {
  expense: 'EXPENSE',
  labourExpense: 'LABOUR_EXPENSE',
  revenue: 'REVENUE',
};

const buildLabourTransactionsFromTasks = (
  tasks,
  getTaskType,
  userFarmsOfFarm,
  dateFilter,
  expenseTypeFilter,
) => {
  const filteredTasks = tasks
    .map((task) => ({ ...task, date: task.complete_date ?? task.abandon_date }))
    .filter(
      (task) =>
        task.duration &&
        (!dateFilter ||
          (moment(task.date).isSameOrAfter(dateFilter.startDate, 'day') &&
            moment(task.date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
        // We don't have an actual Labour expense type, but we allow to filter by it in the Expense types filter.
        (!expenseTypeFilter || expenseTypeFilter.includes(transactionTypeEnum.labourExpense)),
    );
  // We only want to show one Labour transaction per day. When expanding the item details on how that transaction was summed up from tasks will be displayed.
  const groupedTasks = Object.groupBy(filteredTasks, ({ date }) => date);
  const groupedTransactions = [];

  Object.keys(groupedTasks).forEach((date) => {
    const tasks = groupedTasks[date].map((task) => {
      const minutes = parseInt(task.duration, 10);
      const hours = roundToTwoDecimal(minutes / 60);
      const rate = roundToTwoDecimal(task.wage_at_moment);
      const labourCost = roundToTwoDecimal(rate * hours);
      const assignee = userFarmsOfFarm.find((user) => user.user_id === task.assignee_user_id);
      return {
        employee: `${assignee.first_name} ${assignee.last_name.substring(0, 1).toUpperCase()}.`,
        task: getTaskType(task.task_type_id)?.task_name,
        time: hours,
        labourCost,
      };
    });
    const amount = tasks.reduce((sum, task) => sum + task.labourCost, 0);
    if (amount > 0) {
      groupedTransactions.push({
        date,
        transactionType: transactionTypeEnum.labourExpense,
        amount: -amount,
        tasks,
      });
    }
  });

  return groupedTransactions;
};

const buildExpenseTransactions = (expenses, getExpenseType, dateFilter, expenseTypeFilter, t) => {
  return expenses
    .filter(
      (expense) =>
        (!dateFilter ||
          (moment(expense.expense_date).isSameOrAfter(dateFilter.startDate, 'day') &&
            moment(expense.expense_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
        (!expenseTypeFilter || expenseTypeFilter.includes(expense.expense_type_id)) &&
        expense.value > 0,
    )
    .map((expense) => {
      const expenseType = getExpenseType(expense.expense_type_id);
      return {
        date: expense.expense_date,
        transactionType: transactionTypeEnum.expense,
        typeLabel: expenseType.farm_id
          ? expenseType?.expense_name
          : t(`expense:${expenseType?.expense_translation_key}`),
        amount: -roundToTwoDecimal(expense.value),
        note: expense.note,
      };
    });
};

const buildRevenueTransactions = (
  sales,
  getRevenueType,
  getCropVariety,
  dateFilter,
  revenueTypeFilter,
  t,
) => {
  const filteredSales = sales.filter(
    (sale) =>
      (!dateFilter ||
        (moment(sale.sale_date).isSameOrAfter(dateFilter.startDate, 'day') &&
          moment(sale.sale_date).isSameOrBefore(dateFilter.endDate, 'day'))) &&
      (!revenueTypeFilter || revenueTypeFilter.includes(sale.revenue_type_id)),
  );

  // We only want to show one revenue transaction per type per day. When expanding the item details on how that transaction was summed up from tasks will be displayed.
  const groupedByRevenueTypeSales = Object.groupBy(
    filteredSales,
    ({ revenue_type_id }) => revenue_type_id,
  );
  const groupedTransactions = [];

  Object.keys(groupedByRevenueTypeSales).forEach((revenueTypeId) => {
    const groupedByDateSales = Object.groupBy(
      groupedByRevenueTypeSales[revenueTypeId],
      ({ sale_date }) => sale_date,
    );
    const revenueType = getRevenueType(revenueTypeId);
    const typeLabel = revenueType.farm_id
      ? revenueType?.revenue_name
      : t(`revenue:${revenueType?.revenue_translation_key}`);

    Object.keys(groupedByDateSales).forEach((date) => {
      const sales = [];
      groupedByDateSales[date].forEach((sale) => {
        const note = sale.note;
        const customerName = sale.customer_name;
        const cropVarietySales = sale.crop_variety_sale;

        const saleProps = {
          note,
          customerName,
        };

        if (cropVarietySales && cropVarietySales.length > 0) {
          cropVarietySales.forEach((cropSale) => {
            const quantity = roundToTwoDecimal(getMass(cropSale.quantity)?.toString());
            const {
              crop_variety_name,
              crop: { crop_translation_key },
            } = getCropVariety(cropSale.crop_variety_id);
            const crop = crop_variety_name
              ? `${crop_variety_name}, ${t(`crop:${crop_translation_key}`)}`
              : t(`crop:${crop_translation_key}`);

            sales.push({
              ...saleProps,
              crop,
              quantity,
              amount: cropSale.sale_value,
            });
          });
        } else {
          sales.push({
            ...saleProps,
            amount: roundToTwoDecimal(sale.value),
          });
        }
      });
      const amount = sales.reduce((sum, sale) => sum + sale.amount, 0);
      groupedTransactions.push({
        date,
        transactionType: transactionTypeEnum.revenue,
        typeLabel,
        amount,
        sales,
      });
    });
  });

  return groupedTransactions;
};

export default function useTransactions(dateFilter, expenseTypeFilter, revenueTypeFilter) {
  const sales = useSelector(salesSelector);
  const tasks = useSelector(tasksSelector);
  const expenses = useSelector(expenseSelector);
  const getExpenseType = (id) => useSelector(expenseTypeByIdSelector(id));
  const getRevenueType = (id) => useSelector(revenueTypeSelector(id));
  const getTaskType = (id) => useSelector(taskTypeSelector(id));
  const getCropVariety = (id) => useSelector(cropVarietySelector(id));
  const userFarmsOfFarm = useSelector(userFarmsByFarmSelector);
  const { t } = useTranslation();

  const transactions = [
    ...buildLabourTransactionsFromTasks(
      tasks,
      getTaskType,
      userFarmsOfFarm,
      dateFilter,
      expenseTypeFilter,
    ),
    ...buildExpenseTransactions(expenses, getExpenseType, dateFilter, expenseTypeFilter, t),
    ...buildRevenueTransactions(
      sales,
      getRevenueType,
      getCropVariety,
      dateFilter,
      revenueTypeFilter,
      t,
    ),
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
}
