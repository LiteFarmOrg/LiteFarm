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

import { describe, expect, test } from 'vitest';
import { buildTransactions } from '../containers/Finances/useTransactions';

const testData = {
  expenses: [
    {
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      expense_date: '2023-10-13T03:00:00.000Z',
      note: 'Expense 1',
      expense_type_id: '699743b4-09ea-11ee-81ec-7ac3b12dfaeb',
      farm_expense_id: 'aff01e2e-69e6-11ee-9b0c-0242ac180006',
      value: 10,
    },
    {
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      expense_date: '2023-10-28T03:00:00.000Z',
      note: 'Expense 2',
      expense_type_id: 'eec8809a-6e7e-11ee-ae85-0242ac180005',
      farm_expense_id: 'c239a46a-69e6-11ee-8e6f-0242ac180006',
      value: 20,
    },
    {
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      expense_date: '2023-10-19T03:00:00.000Z',
      note: 'Expense 3',
      expense_type_id: 'eec8809a-6e7e-11ee-ae85-0242ac180005',
      farm_expense_id: '39bc4644-6e8a-11ee-a583-0242ac180005',
      value: 100,
    },
  ],
  sales: [
    {
      sale_id: 9,
      customer_name: 'Customer 1',
      sale_date: '2023-10-12T00:00:00.000Z',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      revenue_type_id: 1,
      value: null,
      note: null,
      crop_variety_sale: [
        {
          sale_id: 9,
          quantity: 10,
          sale_value: 100,
          crop_variety_id: 'b8b73f02-676f-11ee-af19-0242ac180007',
          quantity_unit: 'kg',
        },
      ],
    },
    {
      sale_id: 16,
      customer_name: 'Customer 2',
      sale_date: '2023-10-18T00:00:00.000Z',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      revenue_type_id: 1,
      value: null,
      note: null,
      crop_variety_sale: [
        {
          sale_id: 16,
          quantity: 10,
          sale_value: 10,
          crop_variety_id: 'b8b73f02-676f-11ee-af19-0242ac180007',
          quantity_unit: 'kg',
        },
        {
          sale_id: 16,
          quantity: 10,
          sale_value: 20,
          crop_variety_id: 'e19e81de-6e16-11ee-8cc5-0242ac180005',
          quantity_unit: 'mt',
        },
      ],
    },
    {
      sale_id: 18,
      customer_name: 'Customer 3',
      sale_date: '2023-10-18T00:00:00.000Z',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      revenue_type_id: 2,
      value: 200,
      note: '',
      crop_variety_sale: [],
    },
  ],
  expenseTypes: [
    {
      expense_name: 'Equipment',
      farm_id: null,
      expense_type_id: '699743b4-09ea-11ee-81ec-7ac3b12dfaeb',
      deleted: false,
      expense_translation_key: 'EQUIPMENT',
      custom_description: null,
    },
    {
      expense_name: 'Infrastructure',
      farm_id: null,
      expense_type_id: 'eec8809a-6e7e-11ee-ae85-0242ac180005',
      deleted: false,
      expense_translation_key: 'INFRASTRUCTURE',
      custom_description: null,
    },
  ],
  tasks: [
    {
      task_id: 51,
      task_type_id: 19,
      assignee_user_id: '115477689054626801459',
      duration: 240,
      wage_at_moment: 20,
      complete_date: '2023-10-14T00:00:00.000',
    },
    {
      task_id: 52,
      task_type_id: 18,
      assignee_user_id: '115477689054626801459',
      coordinates: null,
      duration: 30,
      wage_at_moment: 20,
      complete_date: '2023-10-20T00:00:00.000',
    },
    {
      task_id: 81,
      task_type_id: 18,
      assignee_user_id: 'a6424cc2-3faa-4be2-a0d1-e202b566b64c',
      duration: 20,
      wage_at_moment: 30,
      complete_date: '2023-10-20T00:00:00.000',
    },
    {
      task_id: 82,
      task_type_id: 19,
      assignee_user_id: 'a6424cc2-3faa-4be2-a0d1-e202b566b64c',
      duration: 120,
      wage_at_moment: 30,
      abandon_date: '2023-10-24T00:00:00.000',
    },
  ],
  taskTypes: [
    {
      task_type_id: 18,
      task_name: 'Cleaning',
      task_translation_key: 'CLEANING_TASK',
      farm_id: null,
      deleted: false,
    },
    {
      task_type_id: 19,
      task_name: 'Transplant',
      task_translation_key: 'TRANSPLANT_TASK',
      farm_id: null,
      deleted: false,
    },
  ],
  revenueTypes: [
    {
      revenue_type_id: 1,
      revenue_name: 'Crop Sale',
      revenue_translation_key: 'CROP_SALE',
      farm_id: null,
      deleted: false,
      agriculture_associated: true,
      crop_generated: true,
    },
    {
      revenue_type_id: 2,
      revenue_name: 'Custom type',
      revenue_translation_key: 'CUSTOM_TYPE',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      deleted: false,
      agriculture_associated: false,
      crop_generated: false,
    },
  ],
  cropVarieties: [
    {
      crop_variety_id: 'b8b73f02-676f-11ee-af19-0242ac180007',
      crop_id: 168,
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      crop_variety_name: 'Abiu',
      crop: {
        crop_translation_key: 'ABIU',
      },
    },
    {
      crop_variety_id: 'e19e81de-6e16-11ee-8cc5-0242ac180005',
      crop_id: 31,
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      crop_variety_name: 'Abricot',
      crop: {
        crop_translation_key: 'ABRICOT',
      },
    },
  ],
  users: [
    {
      user_id: '115477689054626801459',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
      first_name: 'Jack',
      last_name: 'Sparrow',
    },
    {
      user_id: 'a6424cc2-3faa-4be2-a0d1-e202b566b64c',
      first_name: 'Will',
      last_name: 'Turner',
      farm_id: '58079f32-6222-11ee-be35-0242ac180006',
    },
  ],
};

const expenseTypeFilter = {
  '699743b4-09ea-11ee-81ec-7ac3b12dfaeb': {
    active: true,
  },
  'eec8809a-6e7e-11ee-ae85-0242ac180005': {
    active: true,
  },
  LABOUR_EXPENSE: {
    active: true,
  },
};

const revenueTypeFilter = { 1: { active: true }, 2: { active: true } };

const allResults = [
  {
    icon: 'INFRASTRUCTURE',
    date: '2023-10-28T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'INFRASTRUCTURE.EXPENSE_NAME',
    amount: -20,
    note: 'Expense 2',
    relatedId: 'c239a46a-69e6-11ee-8e6f-0242ac180006',
  },
  {
    icon: 'LABOUR',
    date: '2023-10-24T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    typeLabel: 'SALE.FINANCES.LABOUR_LABEL',
    amount: -60,
    items: {
      EMPLOYEE: [{ time: 2, labourCost: 60, employee: 'Will T.' }],
      TASK_TYPE: [{ time: 2, labourCost: 60, taskType: 'TRANSPLANT_TASK' }],
    },
    note: 'FINANCES.TRANSACTION.LABOUR_EXPENSE',
  },
  {
    icon: 'LABOUR',
    date: '2023-10-20T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    typeLabel: 'SALE.FINANCES.LABOUR_LABEL',
    amount: -19.9,
    items: {
      EMPLOYEE: [
        { time: 0.5, labourCost: 10, employee: 'Jack S.' },
        { time: 0.33, labourCost: 9.9, employee: 'Will T.' },
      ],
      TASK_TYPE: [{ time: 0.83, labourCost: 19.9, taskType: 'CLEANING_TASK' }],
    },
    note: 'FINANCES.TRANSACTION.LABOUR_EXPENSE',
  },
  {
    icon: 'INFRASTRUCTURE',
    date: '2023-10-19T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'INFRASTRUCTURE.EXPENSE_NAME',
    amount: -100,
    note: 'Expense 3',
    relatedId: '39bc4644-6e8a-11ee-a583-0242ac180005',
  },
  {
    icon: 'CROP_SALE',
    date: '2023-10-18T00:00:00.000Z',
    transactionType: 'CROP_REVENUE',
    typeLabel: 'CROP_SALE.REVENUE_NAME',
    amount: 30,
    note: 'Customer 2',
    items: [
      {
        amount: 10,
        key: 'b8b73f02-676f-11ee-af19-0242ac180007',
        subtitle: '10 kg',
        title: 'Abiu, ABIU',
        quantity: 10,
        quantityUnit: 'kg',
      },
      {
        amount: 20,
        key: 'e19e81de-6e16-11ee-8cc5-0242ac180005',
        subtitle: '10 kg',
        title: 'Abricot, ABRICOT',
        quantity: 10,
        quantityUnit: 'kg',
      },
    ],
    relatedId: 16,
  },
  {
    icon: 'CUSTOM',
    date: '2023-10-18T00:00:00.000Z',
    transactionType: 'REVENUE',
    typeLabel: 'Custom type',
    amount: 200,
    note: 'Customer 3',
    items: [{ key: 18, title: 'Custom type', amount: 200 }],
    relatedId: 18,
  },
  {
    icon: 'LABOUR',
    date: '2023-10-14T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    typeLabel: 'SALE.FINANCES.LABOUR_LABEL',
    amount: -80,
    items: {
      EMPLOYEE: [{ time: 4, labourCost: 80, employee: 'Jack S.' }],
      TASK_TYPE: [{ time: 4, labourCost: 80, taskType: 'TRANSPLANT_TASK' }],
    },
    note: 'FINANCES.TRANSACTION.LABOUR_EXPENSE',
  },
  {
    icon: 'EQUIPMENT',
    date: '2023-10-13T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'EQUIPMENT.EXPENSE_NAME',
    amount: -10,
    note: 'Expense 1',
    relatedId: 'aff01e2e-69e6-11ee-9b0c-0242ac180006',
  },
  {
    icon: 'CROP_SALE',
    date: '2023-10-12T00:00:00.000Z',
    transactionType: 'CROP_REVENUE',
    typeLabel: 'CROP_SALE.REVENUE_NAME',
    amount: 100,
    note: 'Customer 1',
    items: [
      {
        key: 'b8b73f02-676f-11ee-af19-0242ac180007',
        title: 'Abiu, ABIU',
        subtitle: '10 kg',
        amount: 100,
        quantity: 10,
        quantityUnit: 'kg',
      },
    ],
    relatedId: 9,
  },
];

const filterResultsByIndex = (indexList) =>
  allResults.filter((_result, i) => indexList.includes(i));

describe('buildTransactions test', () => {
  test('Should return all transactions if no filters applied', () => {
    const transactions = buildTransactions(testData);
    expect(transactions).toEqual(allResults);
  });

  test('Should return empty list if empty revenue/expense type filters applied', () => {
    const transactions = buildTransactions({
      ...testData,
      expenseTypeFilter: [],
      revenueTypeFilter: [],
    });
    expect(transactions).toEqual([]);
  });

  test('Should return all transactions if filtering by all revenue/expense type and not by date', () => {
    const transactions = buildTransactions({ ...testData, expenseTypeFilter, revenueTypeFilter });
    expect(transactions).toEqual(allResults);
  });

  test('Should return list of transactions filtered by date', () => {
    const dateFilter = {
      startDate: '2023-10-20T03:00:00.000Z',
      endDate: '2024-10-28T02:59:59.999Z',
    };
    const transactions = buildTransactions({
      ...testData,
      dateFilter,
      expenseTypeFilter,
      revenueTypeFilter,
    });
    const expectedResults = filterResultsByIndex([0, 1, 2]);
    expect(transactions).toEqual(expectedResults);
  });

  test('Should return list of transactions filtered by expense type', () => {
    const firstFilterKey = Object.keys(expenseTypeFilter)[0];
    const transactions = buildTransactions({
      ...testData,
      expenseTypeFilter: { [firstFilterKey]: expenseTypeFilter[firstFilterKey] },
      revenueTypeFilter: {},
    });
    const expectedResults = filterResultsByIndex([7]);
    expect(transactions).toEqual(expectedResults);
  });

  test('Should return list of transactions filtered by revenue type', () => {
    const firstFilterKey = Object.keys(revenueTypeFilter)[0];
    const transactions = buildTransactions({
      ...testData,
      expenseTypeFilter: {},
      revenueTypeFilter: { [firstFilterKey]: revenueTypeFilter[firstFilterKey] },
    });
    const expectedResults = filterResultsByIndex([4, 8]);
    expect(transactions).toEqual(expectedResults);
  });

  test('Should return list of transactions filtered by expense and revenue type', () => {
    const firstExpenseFilterKey = Object.keys(expenseTypeFilter)[0];
    const firstRevenueFilterKey = Object.keys(revenueTypeFilter)[0];
    const transactions = buildTransactions({
      ...testData,
      expenseTypeFilter: { [firstExpenseFilterKey]: expenseTypeFilter[firstExpenseFilterKey] },
      revenueTypeFilter: { [firstRevenueFilterKey]: revenueTypeFilter[firstRevenueFilterKey] },
    });
    const expectedResults = filterResultsByIndex([4, 7, 8]);
    expect(transactions).toEqual(expectedResults);
  });

  test('Should return list of transactions filtered by expense, revenue type and date', () => {
    const dateFilter = {
      startDate: '2023-10-13T03:00:00.000Z',
      endDate: '2024-10-28T02:59:59.999Z',
    };
    const firstExpenseFilterKey = Object.keys(expenseTypeFilter)[0];
    const firstRevenueFilterKey = Object.keys(revenueTypeFilter)[0];
    const transactions = buildTransactions({
      ...testData,
      dateFilter,
      expenseTypeFilter: { [firstExpenseFilterKey]: expenseTypeFilter[firstExpenseFilterKey] },
      revenueTypeFilter: { [firstRevenueFilterKey]: revenueTypeFilter[firstRevenueFilterKey] },
    });
    const expectedResults = filterResultsByIndex([4, 7]);
    expect(transactions).toEqual(expectedResults);
  });
});
