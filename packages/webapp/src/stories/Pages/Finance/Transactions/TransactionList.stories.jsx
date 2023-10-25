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
import TransactionList from '../../../../components/Finances/Transaction/Mobile/List';
import { componentDecorators } from '../../config/Decorators';

export default {
  title: 'Page/Finance/Transactions/TransactionList',
  component: TransactionList,
  decorators: componentDecorators,
};

const data = [
  {
    icon: 'INFRASTRUCTURE',
    date: '2023-10-28T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'Infrastructure',
    amount: -20,
    note: 'Expense 2',
  },
  {
    date: '2023-10-24T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    amount: -60,
    items: {
      EMPLOYEE: [{ time: 2, labourCost: 60, employee: 'Will T.' }],
      TASK_TYPE: [{ time: 2, labourCost: 60, taskType: 'TRANSPLANT_TASK' }],
    },
  },
  {
    date: '2023-10-20T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    amount: -19.9,
    items: {
      EMPLOYEE: [
        { time: 0.5, labourCost: 10, employee: 'Jack S.' },
        { time: 0.33, labourCost: 9.9, employee: 'Will T.' },
      ],
      TASK_TYPE: [{ time: 0.83, labourCost: 19.9, taskType: 'CLEANING_TASK' }],
    },
  },
  {
    icon: 'INFRASTRUCTURE',
    date: '2023-10-19T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'Infrastructure',
    amount: -100,
    note: 'Expense 3',
  },
  {
    icon: 'CROP_SALE',
    date: '2023-10-18T00:00:00.000Z',
    transactionType: 'REVENUE',
    typeLabel: 'Crop Sale',
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
  },
  {
    icon: 'CUSTOM',
    date: '2023-10-18T00:00:00.000Z',
    transactionType: 'REVENUE',
    typeLabel: 'Custom type',
    amount: 200,
    note: 'Customer 3',
    items: [{ key: 18, title: 'Custom type', amount: 200 }],
  },
  {
    date: '2023-10-14T00:00:00.000',
    transactionType: 'LABOUR_EXPENSE',
    amount: -80,
    items: {
      EMPLOYEE: [{ time: 4, labourCost: 80, employee: 'Jack S.' }],
      TASK_TYPE: [{ time: 4, labourCost: 80, taskType: 'TRANSPLANT_TASK' }],
    },
  },
  {
    icon: 'EQUIPMENT',
    date: '2023-10-13T03:00:00.000Z',
    transactionType: 'EXPENSE',
    typeLabel: 'Equipment',
    amount: -10,
    note: 'Expense 1',
  },
  {
    icon: 'CROP_SALE',
    date: '2023-10-12T00:00:00.000Z',
    transactionType: 'REVENUE',
    typeLabel: 'Crop Sale',
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
  },
];

export const SimpleTransactionItem = {
  args: {
    list: data,
    minRows: 5,
  },
};
