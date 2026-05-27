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

import moment from 'moment';
import { chooseIdentification } from '../../Animals/utils';
import { filterSalesByDateRange as filterSalesByDateRangeImpl } from '../../Finances/util';

export interface DateFilter {
  startDate: string | moment.Moment;
  endDate: string | moment.Moment;
}

export interface KpiResult {
  netProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  margin: number;
}

export interface YoYTrend {
  percent: number;
  direction: 'up' | 'down' | 'flat';
}

export interface RevenueGroupBar {
  kind: 'crop' | 'animal' | 'farm_general';
  label: string;
  total: number;
  percentOfTotal: number;
}

export interface ExpenseCategoryBar {
  id: string;
  label: string;
  labelKey: string | null;
  total: number;
  percentOfTotal: number;
}

export type EntityProfitRow =
  | {
      id: string;
      kind: 'crop';
      cropVarietyId: number;
      label: string;
      cropTranslationKey?: string | null;
      revenue: number;
      expense: number;
      netProfit: number;
    }
  | {
      id: string;
      kind: 'animal';
      animalId: number | null;
      batchId: number | null;
      label: string;
      revenue: number;
      expense: number;
      netProfit: number;
    }
  | {
      id: string;
      kind: 'farm_general';
      label: string;
      revenue: number;
      expense: number;
      netProfit: number;
    };

export type EntityTab = 'crops' | 'animals' | 'other';

export const FARM_GENERAL_ROW_ID = 'farm_general';

/**
 * Re-exports the existing Finances helper so callers can resolve sales+expenses
 * filtering through a single utils module.
 */
export const filterSalesByDateRange = filterSalesByDateRangeImpl;

/**
 * Filters an expense list to those whose `expense_date` falls inside the
 * inclusive day-precision date range.
 */
export function filterExpensesByDateRange(
  expenses: any[] | undefined,
  startDate: string | moment.Moment,
  endDate: string | moment.Moment,
): any[] {
  if (!Array.isArray(expenses)) {
    return [];
  }
  return expenses.filter((expense) => {
    const d = moment(expense.expense_date);
    return d.isSameOrAfter(startDate, 'day') && d.isSameOrBefore(endDate, 'day');
  });
}

/**
 * Filters a task list to those whose effective date (completion or abandon)
 * falls inside the inclusive day-precision date range.
 */
export function filterTasksByDateRange(
  tasks: any[] | undefined,
  startDate: string | moment.Moment,
  endDate: string | moment.Moment,
): any[] {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.filter((task) => {
    const effective = task.complete_date ?? task.abandon_date;
    if (!effective) {
      return false;
    }
    const d = moment(effective);
    return d.isSameOrAfter(startDate, 'day') && d.isSameOrBefore(endDate, 'day');
  });
}

function sumSaleValue(sale: any): number {
  if (Array.isArray(sale.crop_variety_sale) && sale.crop_variety_sale.length > 0) {
    return sale.crop_variety_sale.reduce((sum: number, row: any) => sum + (row.sale_value ?? 0), 0);
  }
  if (Array.isArray(sale.animal_sale) && sale.animal_sale.length > 0) {
    return sale.animal_sale.reduce((sum: number, row: any) => sum + (row.sale_value ?? 0), 0);
  }
  return sale.value ?? 0;
}

function taskLabourCost(task: any): number {
  const minutes = parseInt(task.duration, 10);
  const wage = Number(task.wage_at_moment);
  if (!minutes || !wage) {
    return 0;
  }
  return (minutes / 60) * wage;
}

interface CalcKpisInput {
  sales?: any[];
  expenses?: any[];
  tasks?: any[];
  dateFilter: DateFilter;
}

export function calcKpis({
  sales = [],
  expenses = [],
  tasks = [],
  dateFilter,
}: CalcKpisInput): KpiResult {
  const filteredSales = filterSalesByDateRange(sales, dateFilter.startDate, dateFilter.endDate);
  const filteredExpenses = filterExpensesByDateRange(
    expenses,
    dateFilter.startDate,
    dateFilter.endDate,
  );
  const filteredTasks = filterTasksByDateRange(tasks, dateFilter.startDate, dateFilter.endDate);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sumSaleValue(sale), 0);
  const expensesTotal = filteredExpenses.reduce((sum, expense) => sum + (expense.value ?? 0), 0);
  const labourTotal = filteredTasks.reduce((sum, task) => sum + taskLabourCost(task), 0);
  const totalExpenses = expensesTotal + labourTotal;
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return { netProfit, totalRevenue, totalExpenses, margin };
}

/**
 * Computes the year-over-year trend by comparing KPIs over the selected range
 * against the same calendar dates one year prior (e.g. Mar–Apr 2025 vs
 * Mar–Apr 2024).
 */
export function calcYoYTrend(
  args: Omit<CalcKpisInput, 'dateFilter'>,
  currentRange: DateFilter,
): YoYTrend | null {
  const start = moment(currentRange.startDate);
  const end = moment(currentRange.endDate);

  const prevStart = start.clone().subtract(1, 'year');
  const prevEnd = end.clone().subtract(1, 'year');

  const current = calcKpis({ ...args, dateFilter: currentRange });
  const previous = calcKpis({
    ...args,
    dateFilter: {
      startDate: prevStart.format('YYYY-MM-DD'),
      endDate: prevEnd.format('YYYY-MM-DD'),
    },
  });

  if (previous.totalRevenue === 0 && previous.totalExpenses === 0) {
    return null;
  }

  if (previous.netProfit === 0) {
    if (current.netProfit === 0) {
      return { percent: 0, direction: 'flat' };
    }
    return { percent: 100, direction: current.netProfit > 0 ? 'up' : 'down' };
  }
  const raw = ((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100;
  const rounded = Math.round(raw);
  let direction: YoYTrend['direction'] = 'flat';
  if (rounded > 0) {
    direction = 'up';
  } else if (rounded < 0) {
    direction = 'down';
  }
  return { percent: Math.abs(rounded), direction };
}

function withPercentOfTotal<T extends { total: number }>(
  rows: T[],
): (T & { percentOfTotal: number })[] {
  const sum = rows.reduce((s, row) => s + row.total, 0);
  return rows.map((row) => ({
    ...row,
    percentOfTotal: sum > 0 ? Math.round((row.total / sum) * 100) : 0,
  }));
}

/**
 * Groups sales revenue into three buckets by `revenue_type.entity_type`:
 * `crop`, `animal`, and `farm_general` (anything without an entity type).
 * Returns one bar per non-empty bucket. Labels are returned as i18n sub-keys
 * (e.g. `'CROP_SALES'`); the consuming component owns localisation under the
 * `REVENUE_GROUP` namespace.
 */
export function groupRevenueByEntityType(
  sales: any[] | undefined,
  revenueTypes: any[] | undefined,
  dateFilter: DateFilter,
): RevenueGroupBar[] {
  const filtered = filterSalesByDateRange(sales ?? [], dateFilter.startDate, dateFilter.endDate);
  const types = revenueTypes ?? [];
  const totals = { crop: 0, animal: 0, farm_general: 0 };

  for (const sale of filtered) {
    const revenueType = types.find((rt: any) => rt.revenue_type_id === sale.revenue_type_id);
    const entityType = revenueType?.entity_type ?? null;
    const value = sumSaleValue(sale);
    if (entityType === 'crop') {
      totals.crop += value;
    } else if (entityType === 'animal') {
      totals.animal += value;
    } else {
      totals.farm_general += value;
    }
  }

  const rows: Omit<RevenueGroupBar, 'percentOfTotal'>[] = (
    [
      { kind: 'crop', label: 'CROP_SALES', total: totals.crop },
      { kind: 'animal', label: 'ANIMAL_SALES', total: totals.animal },
      { kind: 'farm_general', label: 'FARM_GENERAL', total: totals.farm_general },
    ] as const
  )
    .filter((row) => row.total > 0)
    .map((row) => ({ kind: row.kind, label: row.label, total: row.total }));

  return withPercentOfTotal(rows);
}

/**
 * Returns the top N expense categories by total value within the date range.
 * Includes a synthetic "Labour" category aggregated from tasks' wage * duration.
 *
 * For custom expense types, `label` is the user-supplied `expense_name` and
 * `labelKey` is `null`. For system expense types, `label` is empty and
 * `labelKey` is the i18n key (e.g. `'expense:SEEDS.EXPENSE_NAME'`). For
 * labour, `labelKey` is `'profitability:LABOUR'` so the component can resolve
 * it from the widget namespace.
 */
export function topNExpenseCategories(
  expenses: any[] | undefined,
  expenseTypes: any[] | undefined,
  tasks: any[] | undefined,
  n: number,
  dateFilter: DateFilter,
): ExpenseCategoryBar[] {
  const filteredExpenses = filterExpensesByDateRange(
    expenses ?? [],
    dateFilter.startDate,
    dateFilter.endDate,
  );
  const filteredTasks = filterTasksByDateRange(
    tasks ?? [],
    dateFilter.startDate,
    dateFilter.endDate,
  );

  const totalsByType = new Map<number, number>();
  for (const expense of filteredExpenses) {
    if (expense.expense_type_id == null) {
      continue;
    }
    const cur = totalsByType.get(expense.expense_type_id) ?? 0;
    totalsByType.set(expense.expense_type_id, cur + (expense.value ?? 0));
  }

  const typeLookup = expenseTypes ?? [];
  const categories: Omit<ExpenseCategoryBar, 'percentOfTotal'>[] = [];

  for (const [typeId, total] of totalsByType.entries()) {
    const type = typeLookup.find((t: any) => t.expense_type_id === typeId);
    if (!type) {
      continue;
    }
    const isCustom = type.farm_id != null;
    categories.push({
      id: `expense_${typeId}`,
      label: isCustom ? (type.expense_name ?? '') : '',
      labelKey: isCustom ? null : `expense:${type.expense_translation_key}.EXPENSE_NAME`,
      total,
    });
  }

  const labourTotal = filteredTasks.reduce((sum, task) => sum + taskLabourCost(task), 0);
  if (labourTotal > 0) {
    categories.push({
      id: 'labour',
      label: '',
      labelKey: 'profitability:LABOUR',
      total: labourTotal,
    });
  }

  categories.sort((a, b) => b.total - a.total);
  return withPercentOfTotal(categories.slice(0, n));
}

interface AggregateByEntityInput {
  sales?: any[];
  expenses?: any[];
  tasks?: any[];
  revenueTypes?: any[];
  cropVarieties?: any[];
  animals?: any[];
  animalBatches?: any[];
  dateFilter: DateFilter;
  entityTab: EntityTab;
}

/**
 * Walks sales (`crop_variety_sale` / `animal_sale`) and expenses
 * (`farm_expense_crop_variety` / `farm_expense_animal`) to attribute revenue
 * and expense per-entity. Returns rows shaped for the entity-profit table.
 *
 * For the `'other'` tab, returns only the synthetic `farm_general` row
 * (sales whose revenue type has no entity type + expenses with no entity
 * allocations).
 */
export function aggregateByEntity({
  sales = [],
  expenses = [],
  tasks = [],
  revenueTypes = [],
  cropVarieties = [],
  animals = [],
  animalBatches = [],
  dateFilter,
  entityTab,
}: AggregateByEntityInput): EntityProfitRow[] {
  const filteredSales = filterSalesByDateRange(sales, dateFilter.startDate, dateFilter.endDate);
  const filteredExpenses = filterExpensesByDateRange(
    expenses,
    dateFilter.startDate,
    dateFilter.endDate,
  );
  const filteredTasks = filterTasksByDateRange(tasks, dateFilter.startDate, dateFilter.endDate);

  const cropTotals = new Map<
    string,
    { id: string; cropVarietyId: number; revenue: number; expense: number }
  >();
  const animalTotals = new Map<
    string,
    {
      id: string;
      animalId: number | null;
      batchId: number | null;
      revenue: number;
      expense: number;
    }
  >();
  let farmGeneralRevenue = 0;
  let farmGeneralExpense = 0;

  for (const sale of filteredSales) {
    const revenueType = revenueTypes.find((rt: any) => rt.revenue_type_id === sale.revenue_type_id);
    const entityType = revenueType?.entity_type ?? null;
    if (entityType === 'crop' && Array.isArray(sale.crop_variety_sale)) {
      for (const row of sale.crop_variety_sale) {
        const key = `crop_${row.crop_variety_id}`;
        const entry = cropTotals.get(key) ?? {
          id: key,
          cropVarietyId: row.crop_variety_id,
          revenue: 0,
          expense: 0,
        };
        entry.revenue += row.sale_value ?? 0;
        cropTotals.set(key, entry);
      }
    } else if (entityType === 'animal' && Array.isArray(sale.animal_sale)) {
      for (const row of sale.animal_sale) {
        const animalId = row.animal_id ?? null;
        const batchId = row.animal_batch_id ?? null;
        const key = animalId != null ? `animal_${animalId}` : `batch_${batchId}`;
        const entry = animalTotals.get(key) ?? {
          id: key,
          animalId,
          batchId,
          revenue: 0,
          expense: 0,
        };
        entry.revenue += row.sale_value ?? 0;
        animalTotals.set(key, entry);
      }
    } else if (entityType == null) {
      farmGeneralRevenue += sale.value ?? 0;
    }
  }

  for (const expense of filteredExpenses) {
    const cropAllocs: any[] = expense.farm_expense_crop_variety ?? [];
    const animalAllocs: any[] = expense.farm_expense_animal ?? [];
    const hasAllocations = cropAllocs.length > 0 || animalAllocs.length > 0;

    for (const alloc of cropAllocs) {
      const key = `crop_${alloc.crop_variety_id}`;
      const entry = cropTotals.get(key) ?? {
        id: key,
        cropVarietyId: alloc.crop_variety_id,
        revenue: 0,
        expense: 0,
      };
      entry.expense += alloc.allocated_value ?? 0;
      cropTotals.set(key, entry);
    }
    for (const alloc of animalAllocs) {
      const animalId = alloc.animal_id ?? null;
      const batchId = alloc.animal_batch_id ?? null;
      const key = animalId != null ? `animal_${animalId}` : `batch_${batchId}`;
      const entry = animalTotals.get(key) ?? {
        id: key,
        animalId,
        batchId,
        revenue: 0,
        expense: 0,
      };
      entry.expense += alloc.allocated_value ?? 0;
      animalTotals.set(key, entry);
    }
    if (!hasAllocations) {
      farmGeneralExpense += expense.value ?? 0;
    }
  }

  const labourTotal = filteredTasks.reduce((sum, task) => sum + taskLabourCost(task), 0);
  farmGeneralExpense += labourTotal;

  const cropRows: EntityProfitRow[] = [...cropTotals.values()].map((entry) => {
    const cropVariety = cropVarieties.find((cv: any) => cv.crop_variety_id === entry.cropVarietyId);
    return {
      id: entry.id,
      kind: 'crop',
      cropVarietyId: entry.cropVarietyId,
      label: cropVariety?.crop_variety_name ?? '',
      cropTranslationKey: cropVariety?.crop?.crop_translation_key ?? null,
      revenue: entry.revenue,
      expense: entry.expense,
      netProfit: entry.revenue - entry.expense,
    };
  });

  const animalRows: EntityProfitRow[] = [...animalTotals.values()].map((entry) => {
    const match =
      entry.animalId != null
        ? animals.find((a: any) => a.id === entry.animalId)
        : animalBatches.find((b: any) => b.id === entry.batchId);
    const label = match ? chooseIdentification(match) : '';
    return {
      id: entry.id,
      kind: 'animal',
      animalId: entry.animalId,
      batchId: entry.batchId,
      label,
      revenue: entry.revenue,
      expense: entry.expense,
      netProfit: entry.revenue - entry.expense,
    };
  });

  if (entityTab === 'crops') {
    return cropRows;
  }
  if (entityTab === 'animals') {
    return animalRows;
  }
  if (farmGeneralRevenue > 0 || farmGeneralExpense > 0) {
    return [
      {
        id: FARM_GENERAL_ROW_ID,
        kind: 'farm_general',
        label: '',
        revenue: farmGeneralRevenue,
        expense: farmGeneralExpense,
        netProfit: farmGeneralRevenue - farmGeneralExpense,
      },
    ];
  }
  return [];
}

/**
 * Returns a continuous descending range of calendar years from
 * `currentYear - 1` down to the earliest year present in sales, expenses,
 * or wage-bearing tasks. Years with no transactions appear in the range so
 * the dropdown never has gaps.
 *
 * A task is "wage-bearing" when `taskLabourCost` returns a positive value
 * (i.e. both `duration` and `wage_at_moment` are non-zero), matching the
 * condition under which `useTransactions` creates a LABOUR_EXPENSE entry.
 */
export function getAvailableYears(
  sales: any[] | undefined,
  expenses: any[] | undefined,
  tasks?: any[] | undefined,
  baseDate: Date = new Date(),
): number[] {
  const currentYear = baseDate.getFullYear();
  let earliestYear = Infinity;

  for (const sale of sales ?? []) {
    if (sale.sale_date) {
      const y = new Date(sale.sale_date).getFullYear();
      if (y < currentYear && y < earliestYear) {
        earliestYear = y;
      }
    }
  }
  for (const expense of expenses ?? []) {
    if (expense.expense_date) {
      const y = new Date(expense.expense_date).getFullYear();
      if (y < currentYear && y < earliestYear) {
        earliestYear = y;
      }
    }
  }
  for (const task of tasks ?? []) {
    const effectiveDate = task.complete_date ?? task.abandon_date;
    if (effectiveDate && taskLabourCost(task) > 0) {
      const y = new Date(effectiveDate).getFullYear();
      if (y < currentYear && y < earliestYear) {
        earliestYear = y;
      }
    }
  }

  if (earliestYear === Infinity) {
    return [];
  }

  const years: number[] = [];
  for (let y = currentYear - 1; y >= earliestYear; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Builds the `DateRangeSelector` dynamicOptions entry for a calendar year
 * (Jan 1 → Dec 31).
 */
export function formatYearOption(year: number): {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
} {
  return {
    value: `year_${year}`,
    label: String(year),
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}
