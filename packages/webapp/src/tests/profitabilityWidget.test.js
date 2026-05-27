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
import { describe, expect, test } from 'vitest';
import {
  aggregateByEntity,
  calcKpis,
  calcYoYTrend,
  filterExpensesByDateRange,
  filterTasksByDateRange,
  formatYearOption,
  getAvailableYears,
  groupRevenueByEntityType,
  topNExpenseCategories,
} from '../containers/Home/ProfitabilityWidget/utils';

const dateFilter = { startDate: '2025-01-01', endDate: '2025-12-31' };

const revenueTypes = [
  { revenue_type_id: 1, entity_type: 'crop', revenue_name: 'Crop Sale' },
  { revenue_type_id: 2, entity_type: 'animal', revenue_name: 'Animal Sale' },
  { revenue_type_id: 3, entity_type: null, revenue_name: 'Farm tour' },
];

const expenseTypes = [
  {
    expense_type_id: 10,
    farm_id: null,
    expense_translation_key: 'SEEDS',
    expense_name: 'Seeds',
  },
  {
    expense_type_id: 11,
    farm_id: 'farm-1',
    expense_name: 'Diesel',
  },
];

const sales = [
  // Crop sale in range
  {
    sale_id: 1,
    revenue_type_id: 1,
    sale_date: '2025-03-15',
    crop_variety_sale: [
      { crop_variety_id: 100, sale_value: 120 },
      { crop_variety_id: 101, sale_value: 80 },
    ],
  },
  // Animal sale in range
  {
    sale_id: 2,
    revenue_type_id: 2,
    sale_date: '2025-06-10',
    animal_sale: [
      { animal_id: 50, sale_value: 200 },
      { animal_batch_id: 60, animal_id: null, sale_value: 100 },
    ],
  },
  // Farm-general sale in range
  {
    sale_id: 3,
    revenue_type_id: 3,
    sale_date: '2025-08-01',
    value: 45,
  },
  // Out-of-range sale (should be ignored)
  {
    sale_id: 4,
    revenue_type_id: 1,
    sale_date: '2024-12-31',
    crop_variety_sale: [{ crop_variety_id: 100, sale_value: 999 }],
  },
];

const expenses = [
  // Seeds expense with allocations to two crop varieties
  {
    farm_expense_id: 1000,
    expense_type_id: 10,
    expense_date: '2025-04-05',
    value: 60,
    farm_expense_crop_variety: [
      { crop_variety_id: 100, allocated_value: 40 },
      { crop_variety_id: 102, allocated_value: 20 },
    ],
    farm_expense_animal: [],
  },
  // Diesel expense allocated to an animal (no batch)
  {
    farm_expense_id: 1001,
    expense_type_id: 11,
    expense_date: '2025-06-15',
    value: 30,
    farm_expense_crop_variety: [],
    farm_expense_animal: [{ animal_id: 50, allocated_value: 30 }],
  },
  // Diesel expense with no allocations (farm-general)
  {
    farm_expense_id: 1002,
    expense_type_id: 11,
    expense_date: '2025-07-01',
    value: 25,
    farm_expense_crop_variety: [],
    farm_expense_animal: [],
  },
  // Out-of-range expense (should be ignored)
  {
    farm_expense_id: 1003,
    expense_type_id: 10,
    expense_date: '2024-10-01',
    value: 500,
    farm_expense_crop_variety: [],
    farm_expense_animal: [],
  },
];

const tasks = [
  { task_id: 1, complete_date: '2025-02-01', duration: '60', wage_at_moment: 20 }, // 1h * $20 = $20
  { task_id: 2, complete_date: '2025-05-01', duration: '120', wage_at_moment: 15 }, // 2h * $15 = $30
  { task_id: 3, complete_date: '2024-01-01', duration: '60', wage_at_moment: 50 }, // out of range
  { task_id: 4, abandon_date: '2025-04-01', duration: '30', wage_at_moment: 10 }, // 0.5h * $10 = $5
];

const cropVarieties = [
  {
    crop_variety_id: 100,
    crop_variety_name: 'Yellow Carrot',
    crop: { crop_translation_key: 'CARROT' },
  },
  {
    crop_variety_id: 101,
    crop_variety_name: 'Red Carrot',
    crop: { crop_translation_key: 'CARROT' },
  },
  {
    crop_variety_id: 102,
    crop_variety_name: 'Heirloom Tomato',
    crop: { crop_translation_key: 'TOMATO' },
  },
];

const animals = [{ id: 50, name: 'Bessie', identifier: null, default_type_id: 1 }];

const animalBatches = [{ id: 60, name: 'Spring Calves', count: 5, default_type_id: 1 }];

describe('filterExpensesByDateRange', () => {
  test('keeps only expenses inside the inclusive range', () => {
    const result = filterExpensesByDateRange(expenses, '2025-04-01', '2025-06-30');
    expect(result.map((e) => e.farm_expense_id)).toEqual([1000, 1001]);
  });

  test('returns an empty array when input is not an array', () => {
    expect(filterExpensesByDateRange(undefined, '2025-01-01', '2025-12-31')).toEqual([]);
  });
});

describe('filterTasksByDateRange', () => {
  test('uses complete_date or abandon_date for filtering', () => {
    const result = filterTasksByDateRange(tasks, '2025-01-01', '2025-12-31');
    expect(result.map((t) => t.task_id).sort()).toEqual([1, 2, 4]);
  });

  test('drops tasks with no completion or abandon date', () => {
    expect(filterTasksByDateRange([{ task_id: 99 }], '2025-01-01', '2025-12-31')).toEqual([]);
  });
});

describe('calcKpis', () => {
  test('sums revenue from all sale shapes and combines expenses + labour', () => {
    const result = calcKpis({ sales, expenses, tasks, dateFilter });
    // Revenue: 120+80 (crop) + 200+100 (animal) + 45 (farm-general) = 545
    expect(result.totalRevenue).toBe(545);
    // Expenses: 60 + 30 + 25 = 115 (non-labour) + 20 + 30 + 5 = 55 (labour) = 170
    expect(result.totalExpenses).toBe(170);
    expect(result.netProfit).toBe(375);
    // 375 / 545 ≈ 0.6881 → 69%
    expect(result.margin).toBe(69);
  });

  test('returns margin 0 when totalRevenue is 0', () => {
    const result = calcKpis({ sales: [], expenses, tasks: [], dateFilter });
    expect(result.totalRevenue).toBe(0);
    expect(result.margin).toBe(0);
  });
});

describe('calcYoYTrend', () => {
  test('returns up when current period net profit beats the same dates one year prior', () => {
    const currentRange = { startDate: '2025-07-01', endDate: '2025-07-31' };
    const localSales = [
      {
        sale_id: 1,
        revenue_type_id: 1,
        sale_date: '2025-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 200 }],
      },
      {
        sale_id: 2,
        revenue_type_id: 1,
        sale_date: '2024-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 100 }],
      },
    ];
    const trend = calcYoYTrend({ sales: localSales, expenses: [], tasks: [] }, currentRange);
    expect(trend.direction).toBe('up');
    expect(trend.percent).toBe(100);
  });

  test('returns flat when both periods have equal net profit', () => {
    const currentRange = { startDate: '2025-07-01', endDate: '2025-07-31' };
    const localSales = [
      {
        sale_id: 1,
        revenue_type_id: 1,
        sale_date: '2025-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 100 }],
      },
      {
        sale_id: 2,
        revenue_type_id: 1,
        sale_date: '2024-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 100 }],
      },
    ];
    const trend = calcYoYTrend({ sales: localSales, expenses: [], tasks: [] }, currentRange);
    expect(trend).toEqual({ percent: 0, direction: 'flat' });
  });

  test('returns null when previous year has no transactions', () => {
    const currentRange = { startDate: '2025-07-01', endDate: '2025-07-31' };
    const localSales = [
      {
        sale_id: 1,
        revenue_type_id: 1,
        sale_date: '2025-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 200 }],
      },
    ];
    const trend = calcYoYTrend({ sales: localSales, expenses: [], tasks: [] }, currentRange);
    expect(trend).toBeNull();
  });
});

describe('groupRevenueByEntityType', () => {
  test('groups sales by entity type and excludes empty buckets', () => {
    const result = groupRevenueByEntityType(sales, revenueTypes, dateFilter);
    const byKind = Object.fromEntries(result.map((r) => [r.kind, r.total]));
    expect(byKind).toEqual({ crop: 200, animal: 300, farm_general: 45 });
    // percentOfTotal: sum = 545. animal 300/545 ≈ 55%.
    const animal = result.find((r) => r.kind === 'animal');
    expect(animal.percentOfTotal).toBe(55);
  });

  test('uses i18n sub-keys for labels (component owns localisation)', () => {
    const result = groupRevenueByEntityType(sales, revenueTypes, dateFilter);
    const labels = result.map((r) => r.label).sort();
    expect(labels).toEqual(['ANIMAL_SALES', 'CROP_SALES', 'FARM_GENERAL']);
  });
});

describe('topNExpenseCategories', () => {
  test('returns custom and system entries plus a Labour category, with the highest total first', () => {
    const result = topNExpenseCategories(expenses, expenseTypes, tasks, 5, dateFilter);
    // Seeds = 60, Diesel = 30+25 = 55, Labour = 20+30+5 = 55. Top entry is Seeds.
    expect(result[0].id).toBe('expense_10');
    expect(new Set(result.map((r) => r.id))).toEqual(
      new Set(['expense_10', 'expense_11', 'labour']),
    );
    expect(result.find((r) => r.id === 'expense_10').total).toBe(60);
    expect(result.find((r) => r.id === 'expense_11').total).toBe(55);
    expect(result.find((r) => r.id === 'labour').total).toBe(55);
  });

  test('labels custom expenses with expense_name and system expenses with i18n key', () => {
    const result = topNExpenseCategories(expenses, expenseTypes, tasks, 5, dateFilter);
    const seeds = result.find((r) => r.id === 'expense_10');
    const diesel = result.find((r) => r.id === 'expense_11');
    const labour = result.find((r) => r.id === 'labour');
    expect(seeds).toMatchObject({ label: '', labelKey: 'expense:SEEDS.EXPENSE_NAME' });
    expect(diesel).toMatchObject({ label: 'Diesel', labelKey: null });
    expect(labour).toMatchObject({ label: '', labelKey: 'profitability:LABOUR' });
  });

  test('truncates to top N', () => {
    const result = topNExpenseCategories(expenses, expenseTypes, tasks, 1, dateFilter);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(60);
  });
});

describe('aggregateByEntity', () => {
  test('crops tab aggregates per crop_variety_id and marks expense-only rows as Not yet', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'crops',
    });
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    // 100: revenue 120, expense 40 → profit 80
    expect(byId.crop_100).toMatchObject({ revenue: 120, expense: 40, netProfit: 80 });
    // 101: revenue 80, no expense → profit 80
    expect(byId.crop_101).toMatchObject({ revenue: 80, expense: 0, netProfit: 80 });
    // 102: no revenue, expense 20 → revenue 'Not yet' (null)
    expect(byId.crop_102).toMatchObject({ revenue: null, expense: 20, netProfit: -20 });
  });

  test('animals tab aggregates per animal_id and per animal_batch_id separately', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'animals',
    });
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId.animal_50).toMatchObject({ revenue: 200, expense: 30, netProfit: 170 });
    expect(byId.batch_60).toMatchObject({ revenue: 100, expense: 0, netProfit: 100 });
  });

  test('other tab returns only the farm_general synthetic row', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'other',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: 'farm_general',
      revenue: 45,
      expense: 25,
      netProfit: 20,
    });
  });

  test('crops tab omits the farm_general synthetic row', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'crops',
    });
    expect(rows.find((r) => r.id === 'farm_general')).toBeUndefined();
  });

  test('other tab includes labour in the farm_general expense', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      tasks,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'other',
    });
    expect(rows).toHaveLength(1);
    // Unallocated expenses: 25. Labour: 20 + 30 + 5 = 55. Total: 80.
    expect(rows[0]).toMatchObject({
      kind: 'farm_general',
      revenue: 45,
      expense: 80,
      netProfit: 45 - 80,
    });
  });

  test('crops and animals tabs do not include labour', () => {
    const cropRows = aggregateByEntity({
      sales,
      expenses,
      tasks,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'crops',
    });
    const animalRows = aggregateByEntity({
      sales,
      expenses,
      tasks,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'animals',
    });
    expect(cropRows.find((r) => r.id === 'farm_general')).toBeUndefined();
    expect(animalRows.find((r) => r.id === 'farm_general')).toBeUndefined();
  });

  test('resolves crop variety label and translation key from the lookup', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      dateFilter,
      entityTab: 'crops',
    });
    const yellowCarrot = rows.find((r) => r.id === 'crop_100');
    expect(yellowCarrot.label).toBe('Yellow Carrot');
    expect(yellowCarrot.cropTranslationKey).toBe('CARROT');
  });
});

describe('getAvailableYears', () => {
  test('returns a continuous descending range from currentYear-1 to the earliest year', () => {
    const baseDate = new Date(2026, 0, 15);
    const result = getAvailableYears(
      [
        { sale_date: '2025-03-15' },
        { sale_date: '2023-08-20' },
        { sale_date: '2026-01-02' }, // current year — excluded
      ],
      [{ expense_date: '2024-05-10' }, { expense_date: '2025-11-30' }],
      undefined,
      baseDate,
    );
    expect(result).toEqual([2025, 2024, 2023]);
  });

  test('fills gaps between the earliest year and currentYear-1', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [{ sale_date: '2022-06-01' }],
      [{ expense_date: '2025-11-30' }],
      undefined,
      baseDate,
    );
    expect(result).toEqual([2025, 2024, 2023, 2022]);
  });

  test('includes years from wage-bearing tasks', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [{ sale_date: '2025-03-15' }],
      [],
      [{ complete_date: '2023-07-01', duration: '60', wage_at_moment: 20 }],
      baseDate,
    );
    expect(result).toEqual([2025, 2024, 2023]);
  });

  test('includes years from abandoned tasks with wage data', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [],
      [],
      [{ abandon_date: '2024-04-01', duration: '30', wage_at_moment: 10 }],
      baseDate,
    );
    expect(result).toEqual([2025, 2024]);
  });

  test('excludes tasks with no wage_at_moment', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [{ sale_date: '2025-06-01' }],
      [],
      [{ complete_date: '2022-07-01', duration: '60', wage_at_moment: 0 }],
      baseDate,
    );
    expect(result).toEqual([2025]);
  });

  test('excludes tasks with no duration', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [{ sale_date: '2025-06-01' }],
      [],
      [{ complete_date: '2022-07-01', duration: null, wage_at_moment: 20 }],
      baseDate,
    );
    expect(result).toEqual([2025]);
  });

  test('excludes tasks with no effective date', () => {
    const baseDate = new Date(2026, 0, 1);
    const result = getAvailableYears(
      [{ sale_date: '2025-06-01' }],
      [],
      [{ duration: '60', wage_at_moment: 20 }],
      baseDate,
    );
    expect(result).toEqual([2025]);
  });

  test('handles empty inputs', () => {
    expect(getAvailableYears([], [], [], new Date(2026, 0, 1))).toEqual([]);
    expect(getAvailableYears(undefined, undefined, undefined, new Date(2026, 0, 1))).toEqual([]);
  });
});

describe('formatYearOption', () => {
  test('produces a dropdown entry for the calendar year', () => {
    expect(formatYearOption(2024)).toEqual({
      value: 'year_2024',
      label: '2024',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
  });
});
