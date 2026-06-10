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
import { filterSalesByDateRange, filterExpensesByDateRange } from '../../Finances/util';
import { EntityTab, type TrendDirection } from '../../../components/ProfitabilityWidget/constants';

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
  direction: TrendDirection;
}

export interface RevenueTypeBar {
  id: string;
  label: string;
  labelKey: string | null;
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
      isTotal: false;
      label: string;
      revenue: number;
      expense: number;
      netProfit: number;
    }
  | {
      id: string;
      kind: 'animal';
      isTotal: true;
      defaultTypeId: number | null;
      customTypeId: number | null;
      label: string;
      typeTranslationKey?: string | null;
      revenue: number;
      expense: number;
      netProfit: number;
    };

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
  const minutes = Number(task.duration);
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

// Above this magnitude a year-over-year change is treated as not meaningful and
// the trend is suppressed (the placeholder is shown instead). A tiny previous-year
// net profit divided into the current year easily produces percentages in the tens
// of thousands, which is noise rather than a useful signal.
const MAX_YOY_TREND_PERCENT = 1000;

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
  if (Math.abs(rounded) > MAX_YOY_TREND_PERCENT) {
    return null;
  }
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
 * Returns the top N revenue types by total value within the date range.
 *
 * For custom revenue types (`farm_id` is set), `label` is the user-supplied
 * `revenue_name` and `labelKey` is `null`. For system revenue types,
 * `label` is empty and `labelKey` is the i18n key
 * (e.g. `'revenue:CROP_SALE.REVENUE_NAME'`).
 */
export function topNRevenueTypes(
  sales: any[] | undefined,
  revenueTypes: any[] | undefined,
  n: number,
  dateFilter: DateFilter,
): RevenueTypeBar[] {
  const filtered = filterSalesByDateRange(sales ?? [], dateFilter.startDate, dateFilter.endDate);

  const totalsByType = new Map<number, number>();
  for (const sale of filtered) {
    if (sale.revenue_type_id == null) {
      continue;
    }
    const cur = totalsByType.get(sale.revenue_type_id) ?? 0;
    totalsByType.set(sale.revenue_type_id, cur + sumSaleValue(sale));
  }

  const typeLookup = revenueTypes ?? [];
  const categories: Omit<RevenueTypeBar, 'percentOfTotal'>[] = [];

  for (const [typeId, total] of totalsByType.entries()) {
    const type = typeLookup.find((t: any) => t.revenue_type_id === typeId);
    if (!type) {
      continue;
    }
    const isCustom = type.farm_id !== null;
    categories.push({
      id: `revenue_${typeId}`,
      label: isCustom ? type.revenue_name ?? '' : '',
      labelKey: isCustom ? null : `revenue:${type.revenue_translation_key}.REVENUE_NAME`,
      total,
    });
  }

  categories.sort((a, b) => b.total - a.total);
  return withPercentOfTotal(categories.slice(0, n));
}

/**
 * Returns true when at least one sale in the date range belongs to a
 * revenue type with a non-null `entity_type` (crop or animal) and carries
 * a positive value. Used by the CTA banner to distinguish "no attributions"
 * from "has attributions".
 */
export function hasAttributedRevenue(
  sales: any[] | undefined,
  revenueTypes: any[] | undefined,
  dateFilter: DateFilter,
): boolean {
  const filtered = filterSalesByDateRange(sales ?? [], dateFilter.startDate, dateFilter.endDate);
  const types = revenueTypes ?? [];
  return filtered.some((sale) => {
    const rt = types.find((t: any) => t.revenue_type_id === sale.revenue_type_id);
    return rt?.entity_type !== null && sumSaleValue(sale) > 0;
  });
}

/**
 * Returns true when at least one expense in the date range carries an
 * allocation to a crop variety or animal/batch with a positive
 * `allocated_value`. Expense attribution is independent of revenue
 * attribution: an expense is attributed directly through its
 * `farm_expense_crop_variety` / `farm_expense_animal` rows, not through a
 * revenue type's `entity_type`. Used alongside `hasAttributedRevenue` so the
 * CTA banner treats a farm with allocated expenses — but no attributed sales —
 * as already having attributions.
 */
export function hasAttributedExpense(expenses: any[] | undefined, dateFilter: DateFilter): boolean {
  const filtered = filterExpensesByDateRange(
    expenses ?? [],
    dateFilter.startDate,
    dateFilter.endDate,
  );
  return filtered.some((expense) => {
    const cropAllocs: any[] = expense.farm_expense_crop_variety ?? [];
    const animalAllocs: any[] = expense.farm_expense_animal ?? [];
    return [...cropAllocs, ...animalAllocs].some((alloc) => (alloc.allocated_value ?? 0) > 0);
  });
}

/**
 * Returns the top N expense categories by total value within the date range.
 * Includes a synthetic "Labour" category aggregated from tasks' wage * duration.
 *
 * For custom expense types, `label` is the user-supplied `expense_name` and
 * `labelKey` is `null`. For system expense types, `label` is empty and
 * `labelKey` is the i18n key (e.g. `'expense:SEEDS.EXPENSE_NAME'`). For
 * labour, `labelKey` is `'SALE.FINANCES.LABOUR_LABEL'`.
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
    if (expense.expense_type_id === null) {
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
    const isCustom = type.farm_id !== null;
    categories.push({
      id: `expense_${typeId}`,
      label: isCustom ? type.expense_name ?? '' : '',
      labelKey: isCustom ? null : `expense:${type.expense_translation_key}.EXPENSE_NAME`,
      total,
    });
  }

  const labourTotal = filteredTasks.reduce((sum, task) => sum + taskLabourCost(task), 0);
  if (labourTotal > 0) {
    categories.push({
      id: 'labour',
      label: '',
      labelKey: 'SALE.FINANCES.LABOUR_LABEL',
      total: labourTotal,
    });
  }

  categories.sort((a, b) => b.total - a.total);
  return withPercentOfTotal(categories.slice(0, n));
}

interface AggregateByEntityInput {
  sales?: any[];
  expenses?: any[];
  revenueTypes?: any[];
  cropVarieties?: any[];
  animals?: any[];
  animalBatches?: any[];
  defaultAnimalTypes?: any[];
  customAnimalTypes?: any[];
  dateFilter: DateFilter;
  entityTab: EntityTab;
}

/**
 * Walks sales (`crop_variety_sale` / `animal_sale`) and expenses
 * (`farm_expense_crop_variety` / `farm_expense_animal`) to attribute revenue
 * and expense per-entity. Returns rows shaped for the entity-profit table.
 *
 * For the `'animals'` tab, returns one row per individual animal/batch
 * (`isTotal: false`) followed by one per-type total row (`isTotal: true`).
 */
export function aggregateByEntity({
  sales = [],
  expenses = [],
  revenueTypes = [],
  cropVarieties = [],
  animals = [],
  animalBatches = [],
  defaultAnimalTypes = [],
  customAnimalTypes = [],
  dateFilter,
  entityTab,
}: AggregateByEntityInput): EntityProfitRow[] {
  const filteredSales = filterSalesByDateRange(sales, dateFilter.startDate, dateFilter.endDate);
  const filteredExpenses = filterExpensesByDateRange(
    expenses,
    dateFilter.startDate,
    dateFilter.endDate,
  );

  const cropTotals = new Map<
    string,
    { id: string; cropVarietyId: number; revenue: number; expense: number }
  >();
  const animalTypeTotals = new Map<
    string,
    {
      id: string;
      defaultTypeId: number | null;
      customTypeId: number | null;
      revenue: number;
      expense: number;
    }
  >();
  const individualAnimalTotals = new Map<
    string,
    {
      id: string;
      animalId: number | null;
      batchId: number | null;
      revenue: number;
      expense: number;
    }
  >();
  const resolveAnimalTypeKey = (animalId: number | null, batchId: number | null): string | null => {
    const match = animalId
      ? animals.find((a: any) => a.id === animalId)
      : animalBatches.find((b: any) => b.id === batchId);

    if (!match) {
      return null;
    }
    if (match.default_type_id) {
      return `default_type_${match.default_type_id}`;
    }
    if (match.custom_type_id) {
      return `custom_type_${match.custom_type_id}`;
    }
    return null;
  };

  const getOrCreateAnimalTypeEntry = (key: string) => {
    const existing = animalTypeTotals.get(key);
    if (existing) {
      return existing;
    }
    const isDefault = key.startsWith('default_type_');
    const typeId = Number(key.split('_').pop());
    const entry = {
      id: key,
      defaultTypeId: isDefault ? typeId : null,
      customTypeId: isDefault ? null : typeId,
      revenue: 0,
      expense: 0,
    };
    animalTypeTotals.set(key, entry);
    return entry;
  };

  const getOrCreateIndividualEntry = (animalId: number | null, batchId: number | null) => {
    const key = animalId ? `animal_${animalId}` : `batch_${batchId}`;
    const existing = individualAnimalTotals.get(key);
    if (existing) {
      return existing;
    }
    const entry = { id: key, animalId, batchId, revenue: 0, expense: 0 };
    individualAnimalTotals.set(key, entry);
    return entry;
  };

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
        getOrCreateIndividualEntry(animalId, batchId).revenue += row.sale_value ?? 0;
        const typeKey = resolveAnimalTypeKey(animalId, batchId);
        if (typeKey) {
          getOrCreateAnimalTypeEntry(typeKey).revenue += row.sale_value ?? 0;
        }
      }
    }
  }

  for (const expense of filteredExpenses) {
    const cropAllocs: any[] = expense.farm_expense_crop_variety ?? [];
    const animalAllocs: any[] = expense.farm_expense_animal ?? [];

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
      getOrCreateIndividualEntry(animalId, batchId).expense += alloc.allocated_value ?? 0;
      const typeKey = resolveAnimalTypeKey(animalId, batchId);
      if (typeKey) {
        getOrCreateAnimalTypeEntry(typeKey).expense += alloc.allocated_value ?? 0;
      }
    }
  }

  if (entityTab === EntityTab.CROPS) {
    return [...cropTotals.values()].map((entry) => {
      const cropVariety = cropVarieties.find(
        (cv: any) => cv.crop_variety_id === entry.cropVarietyId,
      );
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
  }

  const individualAnimalRows: EntityProfitRow[] = [...individualAnimalTotals.values()].map(
    (entry) => {
      const match = entry.animalId
        ? animals.find((a: any) => a.id === entry.animalId)
        : animalBatches.find((b: any) => b.id === entry.batchId);
      return {
        id: entry.id,
        kind: 'animal',
        isTotal: false,
        label: match ? chooseIdentification(match) : '',
        revenue: entry.revenue,
        expense: entry.expense,
        netProfit: entry.revenue - entry.expense,
      };
    },
  );

  const animalTypeRows: EntityProfitRow[] = [...animalTypeTotals.values()].map((entry) => {
    let label = '';
    let typeTranslationKey: string | null = null;
    if (entry.defaultTypeId != null) {
      const type = defaultAnimalTypes.find((t: any) => t.id === entry.defaultTypeId);
      typeTranslationKey = type?.key ?? null;
    } else if (entry.customTypeId != null) {
      const type = customAnimalTypes.find((t: any) => t.id === entry.customTypeId);
      label = type?.type ?? '';
    }
    return {
      id: entry.id,
      kind: 'animal',
      isTotal: true,
      defaultTypeId: entry.defaultTypeId,
      customTypeId: entry.customTypeId,
      label,
      typeTranslationKey,
      revenue: entry.revenue,
      expense: entry.expense,
      netProfit: entry.revenue - entry.expense,
    };
  });

  return [...individualAnimalRows, ...animalTypeRows];
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
