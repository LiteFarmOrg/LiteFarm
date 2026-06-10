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
import { allExpenseTypeSelector, expenseSelector, salesSelector } from '../../Finances/selectors';
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
} from '../../../store/api/apiSlice';
import {
  DateFilter,
  EntityProfitRow,
  ExpenseCategoryBar,
  KpiResult,
  RevenueTypeBar,
  YoYTrend,
  aggregateByEntity,
  calcKpis,
  calcYoYTrend,
  hasAttributedExpense,
  hasAttributedRevenue,
  topNExpenseCategories,
  topNRevenueTypes,
} from './utils';
import { EntityTab } from '../../../components/ProfitabilityWidget/constants';

const TOP_REVENUE_TYPES_COUNT = 5;
const TOP_EXPENSE_CATEGORIES_COUNT = 5;

interface UseProfitabilityDataInput {
  startDate?: string;
  endDate?: string;
  entityTab: EntityTab;
}

export interface UseProfitabilityDataResult {
  kpis: KpiResult;
  yoyTrend: YoYTrend | null;
  topRevenueTypes: RevenueTypeBar[];
  hasAttributions: boolean;
  topExpenseCategories: ExpenseCategoryBar[];
  entityRows: EntityProfitRow[];
  isEmpty: boolean;
  hasCropVarieties: boolean;
  hasAnimals: boolean;
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
  const cropVarieties = useSelector(cropVarietiesSelector);
  const { data: animals } = useGetAnimalsQuery();
  const { data: animalBatches } = useGetAnimalBatchesQuery();
  const { data: defaultAnimalTypes } = useGetDefaultAnimalTypesQuery();
  const { data: customAnimalTypes } = useGetCustomAnimalTypesQuery();

  const dateFilter: DateFilter | null = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return { startDate, endDate };
  }, [startDate, endDate]);

  // mirrors the early return in useTransactions; until types arrive we
  // cannot resolve labels or KPI buckets
  const isLoading = !revenueTypes?.length || !expenseTypes?.length;

  // isEmpty is a property of the farm, not the date range: it is true when
  // the farm has never recorded a sale or expense
  const isEmpty = (sales?.length ?? 0) === 0 && (expenses?.length ?? 0) === 0;

  // for the "you have no <entities>" message on EntityProfitTable
  const hasCropVarieties = (cropVarieties?.length ?? 0) > 0;
  const hasAnimals = (animals?.length ?? 0) + (animalBatches?.length ?? 0) > 0;

  const dateRangeResults = useMemo(() => {
    if (isLoading || !dateFilter) {
      return {
        kpis: EMPTY_KPIS,
        yoyTrend: EMPTY_TREND,
        topRevenueTypes: [] as RevenueTypeBar[],
        hasAttributions: false,
        topExpenseCategories: [] as ExpenseCategoryBar[],
        entityRows: [] as EntityProfitRow[],
      };
    }

    const kpis = calcKpis({ sales, expenses, tasks, dateFilter });
    const yoyTrend = calcYoYTrend({ sales, expenses, tasks }, dateFilter);
    const topRevenueTypesResult = topNRevenueTypes(
      sales,
      revenueTypes,
      TOP_REVENUE_TYPES_COUNT,
      dateFilter,
    );
    const hasAttributionsResult =
      hasAttributedRevenue(sales, revenueTypes, dateFilter) ||
      hasAttributedExpense(expenses, dateFilter);
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
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      defaultAnimalTypes,
      customAnimalTypes,
      dateFilter,
      entityTab,
    });
    return {
      kpis,
      yoyTrend,
      topRevenueTypes: topRevenueTypesResult,
      hasAttributions: hasAttributionsResult,
      topExpenseCategories: topExpenseCategoriesResult,
      entityRows,
    };
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
    defaultAnimalTypes,
    customAnimalTypes,
    entityTab,
  ]);

  return {
    ...dateRangeResults,
    isEmpty,
    hasCropVarieties,
    hasAnimals,
    isLoading,
  };
}
