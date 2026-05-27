/*
 *  Copyright 2026 LiteFarm.org
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
import { cropVarietiesSelector } from '../../cropVarietySlice';
import { allRevenueTypesSelector } from '../../revenueTypeSlice';
import { tasksSelector } from '../../taskSlice';
import { taskTypesSelector } from '../../taskTypeSlice';
import { userFarmsByFarmSelector } from '../../userFarmSlice';
import { allExpenseTypeSelector, expenseSelector, salesSelector } from '../../Finances/selectors';
import { useGetAnimalsQuery, useGetAnimalBatchesQuery } from '../../../store/api/apiSlice';
import {
  DateFilter,
  EntityProfitRow,
  ExpenseCategoryBar,
  KpiResult,
  RevenueGroupBar,
  YoYTrend,
  aggregateByEntity,
  calcKpis,
  calcYoYTrend,
  getAvailableYears,
  groupRevenueByEntityType,
  topNExpenseCategories,
} from './utils';
import { EntityTab } from '../../../components/ProfitabilityWidget/constants';

const TOP_EXPENSE_CATEGORIES_COUNT = 5;

interface UseProfitabilityDataInput {
  startDate?: string;
  endDate?: string;
  entityTab: EntityTab;
}

export interface UseProfitabilityDataResult {
  kpis: KpiResult;
  yoyTrend: YoYTrend | null;
  revenueGroups: RevenueGroupBar[];
  topExpenseCategories: ExpenseCategoryBar[];
  entityRows: EntityProfitRow[];
  availableYears: number[];
  isEmpty: boolean;
  isLoading: boolean;
}

const EMPTY_KPIS: KpiResult = {
  netProfit: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  margin: 0,
};

const EMPTY_TREND: YoYTrend | null = null;

export default function useProfitabilityData({
  startDate,
  endDate,
  entityTab,
}: UseProfitabilityDataInput): UseProfitabilityDataResult {
  const sales = useSelector(salesSelector);
  const expenses = useSelector(expenseSelector);
  const revenueTypes = useSelector(allRevenueTypesSelector);
  const expenseTypes = useSelector(allExpenseTypeSelector);
  const tasks = useSelector(tasksSelector);
  const taskTypes = useSelector(taskTypesSelector);
  const cropVarieties = useSelector(cropVarietiesSelector);
  const users = useSelector(userFarmsByFarmSelector);
  const { data: animals } = useGetAnimalsQuery();
  const { data: animalBatches } = useGetAnimalBatchesQuery();

  const dateFilter: DateFilter | null = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return { startDate, endDate };
  }, [startDate, endDate]);

  // isLoading mirrors the gate used by useTransactions: until the type
  // lookups arrive we cannot resolve labels or KPI buckets.
  const isLoading = !revenueTypes?.length || !expenseTypes?.length;

  // isEmpty is a property of the farm, not the date range: it is true when
  // the farm has never recorded a sale or expense. A farm with old
  // transactions outside the selected range still sees real $0 KPIs, not the
  // CTA banner — only farms that have not yet used the Finances module at
  // all get the skeletoned empty state. Labour-from-tasks is intentionally
  // ignored because the CTA links to Finances, not the Task module.
  const isEmpty = (sales?.length ?? 0) === 0 && (expenses?.length ?? 0) === 0;

  const computed = useMemo(() => {
    if (isLoading || !dateFilter) {
      return {
        kpis: EMPTY_KPIS,
        yoyTrend: EMPTY_TREND,
        revenueGroups: [] as RevenueGroupBar[],
        topExpenseCategories: [] as ExpenseCategoryBar[],
        entityRows: [] as EntityProfitRow[],
        availableYears: [] as number[],
      };
    }

    const kpis = calcKpis({ sales, expenses, tasks, dateFilter });
    const yoyTrend = calcYoYTrend({ sales, expenses, tasks }, dateFilter);
    const revenueGroups = groupRevenueByEntityType(sales, revenueTypes, dateFilter);
    const topExpenseCategoriesResult = topNExpenseCategories(
      expenses,
      expenseTypes,
      tasks,
      TOP_EXPENSE_CATEGORIES_COUNT,
      dateFilter,
    );
    const entityRows = aggregateByEntity({
      sales,
      expenses,
      tasks,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: entityTab as unknown as 'crops' | 'animals' | 'other',
    });
    const availableYears = getAvailableYears(sales ?? [], expenses ?? [], tasks ?? []);

    return {
      kpis,
      yoyTrend,
      revenueGroups,
      topExpenseCategories: topExpenseCategoriesResult,
      entityRows,
      availableYears,
    };
    // The user/taskTypes selectors are read for shape parity with
    // useTransactions; they're not consumed by the pure aggregation utils
    // but are listed so the memo invalidates if the underlying farm switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    dateFilter,
    sales,
    expenses,
    revenueTypes,
    expenseTypes,
    tasks,
    cropVarieties,
    animals,
    animalBatches,
    entityTab,
    taskTypes,
    users,
  ]);

  return {
    ...computed,
    isEmpty,
    isLoading,
  };
}
