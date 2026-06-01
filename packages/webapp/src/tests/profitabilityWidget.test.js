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
  filterTasksByDateRange,
  formatYearOption,
  getAvailableYears,
  hasAttributedExpense,
  hasAttributedRevenue,
  topNExpenseCategories,
  topNRevenueTypes,
} from '../containers/Home/ProfitabilityWidget/utils';

const dateFilter = { startDate: '2025-01-01', endDate: '2025-12-31' };

const revenueTypes = [
  {
    revenue_type_id: 1,
    farm_id: null,
    entity_type: 'crop',
    revenue_name: 'Crop Sale',
    revenue_translation_key: 'CROP_SALE',
  },
  {
    revenue_type_id: 2,
    farm_id: null,
    entity_type: 'animal',
    revenue_name: 'Animal Sale',
    revenue_translation_key: 'ANIMAL_SALE',
  },
  {
    revenue_type_id: 3,
    farm_id: 'farm-1',
    entity_type: null,
    revenue_name: 'Farm tour',
    revenue_translation_key: 'FARM_TOUR',
  },
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

const defaultAnimalTypes = [{ id: 1, key: 'CATTLE' }];

const customAnimalTypes = [{ id: 10, type: 'Alpaca' }];

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

  test('returns null when the year-over-year change exceeds the display cap', () => {
    const currentRange = { startDate: '2025-07-01', endDate: '2025-07-31' };
    // Previous-year net profit 10, current 200 → 1900%, beyond the 1000% cap.
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
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 10 }],
      },
    ];
    const trend = calcYoYTrend({ sales: localSales, expenses: [], tasks: [] }, currentRange);
    expect(trend).toBeNull();
  });

  test('still returns a trend at exactly the display cap', () => {
    const currentRange = { startDate: '2025-07-01', endDate: '2025-07-31' };
    // Previous-year net profit 10, current 110 → exactly 1000%. The guard is
    // `> cap`, so the boundary value is still shown.
    const localSales = [
      {
        sale_id: 1,
        revenue_type_id: 1,
        sale_date: '2025-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 110 }],
      },
      {
        sale_id: 2,
        revenue_type_id: 1,
        sale_date: '2024-07-10',
        crop_variety_sale: [{ crop_variety_id: 1, sale_value: 10 }],
      },
    ];
    const trend = calcYoYTrend({ sales: localSales, expenses: [], tasks: [] }, currentRange);
    expect(trend).toEqual({ percent: 1000, direction: 'up' });
  });
});

describe('topNRevenueTypes', () => {
  test('groups sales by revenue_type_id and returns the highest-total types first', () => {
    const result = topNRevenueTypes(sales, revenueTypes, 5, dateFilter);
    // type 2 (Animal Sale): 200+100 = 300, type 1 (Crop Sale): 120+80 = 200, type 3 (Farm tour): 45
    expect(result.map((r) => r.id)).toEqual(['revenue_2', 'revenue_1', 'revenue_3']);
    expect(result.find((r) => r.id === 'revenue_2').total).toBe(300);
    expect(result.find((r) => r.id === 'revenue_1').total).toBe(200);
    expect(result.find((r) => r.id === 'revenue_3').total).toBe(45);
  });

  test('computes percentOfTotal across returned types', () => {
    const result = topNRevenueTypes(sales, revenueTypes, 5, dateFilter);
    // sum = 545. Animal Sale 300/545 ≈ 55%.
    expect(result.find((r) => r.id === 'revenue_2').percentOfTotal).toBe(55);
  });

  test('labels system types with i18n key and custom types with revenue_name', () => {
    const result = topNRevenueTypes(sales, revenueTypes, 5, dateFilter);
    const cropSale = result.find((r) => r.id === 'revenue_1');
    const farmTour = result.find((r) => r.id === 'revenue_3');
    expect(cropSale).toMatchObject({ label: '', labelKey: 'revenue:CROP_SALE.REVENUE_NAME' });
    expect(farmTour).toMatchObject({ label: 'Farm tour', labelKey: null });
  });

  test('truncates to top N', () => {
    const result = topNRevenueTypes(sales, revenueTypes, 1, dateFilter);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(300);
  });
});

describe('hasAttributedRevenue', () => {
  test('returns true when a sale has a revenue type with non-null entity_type', () => {
    expect(hasAttributedRevenue(sales, revenueTypes, dateFilter)).toBe(true);
  });

  test('returns false when all in-range sales are farm-general', () => {
    const farmGeneralSales = [
      { sale_id: 3, revenue_type_id: 3, sale_date: '2025-08-01', value: 45 },
    ];
    expect(hasAttributedRevenue(farmGeneralSales, revenueTypes, dateFilter)).toBe(false);
  });

  test('returns false when there are no sales in range', () => {
    expect(hasAttributedRevenue([], revenueTypes, dateFilter)).toBe(false);
  });
});

describe('hasAttributedExpense', () => {
  test('returns true when an in-range expense has a crop-variety or animal allocation', () => {
    expect(hasAttributedExpense(expenses, dateFilter)).toBe(true);
  });

  test('returns false when all in-range expenses are farm-general (no allocations)', () => {
    const farmGeneralExpenses = [
      {
        farm_expense_id: 2000,
        expense_date: '2025-07-01',
        value: 25,
        farm_expense_crop_variety: [],
        farm_expense_animal: [],
      },
    ];
    expect(hasAttributedExpense(farmGeneralExpenses, dateFilter)).toBe(false);
  });

  test('returns false when the only attributed expense falls outside the date range', () => {
    const outOfRange = [
      {
        farm_expense_id: 2001,
        expense_date: '2024-04-05',
        value: 60,
        farm_expense_crop_variety: [{ crop_variety_id: 100, allocated_value: 40 }],
        farm_expense_animal: [],
      },
    ];
    expect(hasAttributedExpense(outOfRange, dateFilter)).toBe(false);
  });

  test('returns false when there are no expenses', () => {
    expect(hasAttributedExpense([], dateFilter)).toBe(false);
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
    expect(labour).toMatchObject({ label: '', labelKey: 'SALE.FINANCES.LABOUR_LABEL' });
  });

  test('truncates to top N', () => {
    const result = topNExpenseCategories(expenses, expenseTypes, tasks, 1, dateFilter);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(60);
  });
});

describe('aggregateByEntity', () => {
  test('crops tab aggregates per crop_variety_id', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      defaultAnimalTypes,
      customAnimalTypes,
      dateFilter,
      entityTab: 'crops',
    });
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    // 100: revenue 120, expense 40 → profit 80
    expect(byId.crop_100).toMatchObject({ revenue: 120, expense: 40, netProfit: 80 });
    // 101: revenue 80, no expense → profit 80
    expect(byId.crop_101).toMatchObject({ revenue: 80, expense: 0, netProfit: 80 });
    // 102: no revenue, expense 20 → profit -20
    expect(byId.crop_102).toMatchObject({ revenue: 0, expense: 20, netProfit: -20 });
  });

  test('animals tab lists each individual first, then a per-type total combining individuals and batches', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      defaultAnimalTypes,
      customAnimalTypes,
      dateFilter,
      entityTab: 'animals',
    });
    expect(rows).toHaveLength(3);
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    // Individual animal: Bessie (revenue 200, expense 30)
    expect(byId.animal_50).toMatchObject({
      kind: 'animal',
      isTotal: false,
      label: 'Bessie',
      revenue: 200,
      expense: 30,
      netProfit: 170,
    });
    // Individual batch: Spring Calves (revenue 100, no expense)
    expect(byId.batch_60).toMatchObject({
      kind: 'animal',
      isTotal: false,
      label: 'Spring Calves',
      revenue: 100,
      expense: 0,
      netProfit: 100,
    });
    // Per-type total: both are CATTLE → 300 / 30 / 270
    expect(byId.default_type_1).toMatchObject({
      kind: 'animal',
      isTotal: true,
      defaultTypeId: 1,
      customTypeId: null,
      typeTranslationKey: 'CATTLE',
      revenue: 300,
      expense: 30,
      netProfit: 270,
    });
    // Total rows render after the individual rows
    expect(rows[rows.length - 1].id).toBe('default_type_1');
  });

  test.only('animals tab produces separate total rows for different types', () => {
    const mixedAnimals = [
      { id: 50, name: 'Bessie', identifier: null, default_type_id: 1 },
      { id: 70, name: 'Dolly', identifier: null, custom_type_id: 10 },
    ];
    const mixedSales = [
      {
        sale_id: 2,
        revenue_type_id: 2,
        sale_date: '2025-06-10',
        animal_sale: [
          { animal_id: 50, sale_value: 200 },
          { animal_id: 70, sale_value: 150 },
        ],
      },
    ];
    const rows = aggregateByEntity({
      sales: mixedSales,
      expenses: [],
      revenueTypes,
      cropVarieties,
      animals: mixedAnimals,
      animalBatches: [],
      defaultAnimalTypes,
      customAnimalTypes,
      dateFilter,
      entityTab: 'animals',
    });
    // 2 individuals + 2 type totals
    expect(rows).toHaveLength(4);
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    console.log(byId);
    expect(byId.animal_50).toMatchObject({ isTotal: false, label: 'Bessie', revenue: 200 });
    expect(byId.animal_70).toMatchObject({ isTotal: false, label: 'Dolly', revenue: 150 });
    expect(byId.default_type_1).toMatchObject({
      isTotal: true,
      defaultTypeId: 1,
      typeTranslationKey: 'CATTLE',
      revenue: 200,
    });
    expect(byId.custom_type_10).toMatchObject({
      isTotal: true,
      customTypeId: 10,
      label: 'Alpaca',
      revenue: 150,
    });
  });

  test('resolves crop variety label and translation key from the lookup', () => {
    const rows = aggregateByEntity({
      sales,
      expenses,
      revenueTypes,
      cropVarieties,
      animals,
      animalBatches,
      defaultAnimalTypes,
      customAnimalTypes,
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
