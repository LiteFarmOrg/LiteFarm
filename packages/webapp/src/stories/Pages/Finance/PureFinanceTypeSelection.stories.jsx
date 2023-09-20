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
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import PureFinanceTypeSelection from '../../../components/Finances/PureFinanceTypeSelection';
import { icons } from '../../../containers/Finances/NewExpense/ExpenseCategories';
import { icons as revenueTypeIcons } from '../../../containers/Finances/AddSale/RevenueTypes';

export default {
  title: 'Page/Finance/PureFinanceTypeSelection',
  decorators: decorators,
  component: PureFinanceTypeSelection,
};

const expenseTypes = [
  {
    expense_name: 'Equipment',
    farm_id: null,
    expense_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'EQUIPMENT',
  },
  {
    expense_name: 'Fuel',
    farm_id: null,
    expense_type_id: '1fd86136-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'FUEL',
  },
  {
    expense_name: 'Land',
    farm_id: null,
    expense_type_id: '1fd86168-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'LAND',
  },
  {
    expense_name: 'Machinery',
    farm_id: null,
    expense_type_id: '1fd86154-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'MACHINERY',
  },
  {
    expense_name: 'Other',
    farm_id: null,
    expense_type_id: '1fd8619a-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'OTHER',
  },
  {
    expense_name: 'Pesticide',
    farm_id: null,
    expense_type_id: '1fd86118-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'PESTICIDE',
  },
  {
    expense_name: 'Seeds',
    farm_id: null,
    expense_type_id: '1fd86186-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'SEEDS',
  },
  {
    expense_name: 'Soil Amendment',
    farm_id: null,
    expense_type_id: '1fd8605a-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    expense_translation_key: 'SOIL_AMENDMENT',
  },
  {
    expense_name: 'New type',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    expense_type_id: '461d2e5e-3d4c-11ee-ba15-e66db4bef552',
    deleted: false,
    expense_translation_key: 'NEW',
  },
];

export const Expense = {
  args: {
    title: 'Add Expense',
    leadText: 'Which types of expenses would you like to record?',
    cancelTitle: 'expense creation',
    types: expenseTypes,
    onContinue: () => console.log('CONTINUE'),
    onGoBack: () => console.log('Go back'),
    progressValue: 50,
    onGoToManageCustomType: () => console.log('Go to Management Custom Type'),
    isTypeSelected: false,
    formatTileData: (data) => {
      const { farm_id, expense_translation_key, expense_name } = data;

      return {
        key: expense_translation_key,
        tileKey: expense_translation_key,
        icon: icons[farm_id ? 'OTHER' : expense_translation_key],
        label: expense_name,
        onClick: () => console.log(`${expense_name} clicked!`),
      };
    },
    useHookFormPersist: () => ({ historyCancel: () => ({}) }),
  },
  parameters: { ...chromaticSmallScreen },
};

const revenueTypes = [
  {
    revenue_name: 'Crop sale',
    farm_id: null,
    revenue_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef552',
    deleted: false,
    revenue_translation_key: 'CROP_SALE',
  },
  {
    revenue_name: 'Custom',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    revenue_type_id: '1fd85a60-22a9-11ee-9683-e66db4bef553',
    deleted: false,
    revenue_translation_key: 'CUSTOM',
  },
];

export const Revenue = {
  args: {
    title: 'Add Revenue',
    leadText: 'Which type of revenue would you like to record?',
    cancelTitle: 'revenue creation',
    types: revenueTypes,
    onGoBack: () => console.log('Go back'),
    onCancel: () => console.log('Cancel'),
    progressValue: 50,
    onGoToManageCustomType: () => console.log('Go to Management Custom Type'),
    isTypeSelected: false,
    formatTileData: (data) => {
      const { farm_id, revenue_translation_key, revenue_name } = data;

      return {
        key: revenue_translation_key,
        tileKey: revenue_translation_key,
        icon: farm_id ? revenueTypeIcons['CUSTOM'] : revenueTypeIcons['CROP_SALE'],
        label: revenue_name,
        onClick: () => console.log(`${revenue_name} clicked!`),
      };
    },
    useHookFormPersist: () => ({ historyCancel: () => ({}) }),
  },
  parameters: { ...chromaticSmallScreen },
};
