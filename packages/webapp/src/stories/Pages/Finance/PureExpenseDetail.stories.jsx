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

import React from 'react';
import PureExpenseDetail from '../../../components/Finances/PureExpenseDetail';
import decorators from '../config/Decorators';

export default {
  title: 'Page/Finance/PureExpenseDetail',
  decorators: decorators,
  component: PureExpenseDetail,
};

const Template = (args) => <PureExpenseDetail {...args} />;

const args = {
  handleGoBack: () => {
    console.log('Go back');
  },
  inputLabel: 'Custom Type Name',
  nameFieldRegisterName: 'custom_type_name',
  expense: {
    note: 'Farm kitten',
    expense_date: '2023-09-06T07:00:00.000Z',
    expense_type_id: 'e4c53d48-16f6-11ee-b336-0242ac120004',
    value: 800,
  },
  expenseTypeReactSelectOptions: [
    {
      value: 'e4c53d48-16f6-11ee-b336-0242ac120004',
      label: 'Equipment',
    },
    {
      value: 'e4c5495a-16f6-11ee-b336-0242ac120004',
      label: 'Pest Control',
    },
    {
      value: 'e4c54ac2-16f6-11ee-b336-0242ac120004',
      label: 'Fuel',
    },
    {
      value: 'e4c54b12-16f6-11ee-b336-0242ac120004',
      label: 'Machinery',
    },
    {
      value: 'e4c54b58-16f6-11ee-b336-0242ac120004',
      label: 'Land',
    },
    {
      value: 'e4c54b9e-16f6-11ee-b336-0242ac120004',
      label: 'Seeds and Plants',
    },
    {
      value: 'e4c548e2-16f6-11ee-b336-0242ac120004',
      label: 'Soil Amendment',
    },
    {
      value: 'e4c54bda-16f6-11ee-b336-0242ac120004',
      label: 'Miscellaneous',
    },
    {
      label: 'Utilities',
      value: 'dbdbf7fe-6d2b-11ee-85e7-ce0b8496eaa9',
    },
    {
      label: 'Labour',
      value: 'dbdbfaba-6d2b-11ee-85e7-ce0b8496eaa9',
    },
    {
      label: 'Infrastructure',
      value: 'dbdbfad8-6d2b-11ee-85e7-ce0b8496eaa9',
    },
    {
      label: 'Transportation',
      value: 'dbdbfaec-6d2b-11ee-85e7-ce0b8496eaa9',
    },
    {
      label: 'Services',
      value: 'dbdbfaf6-6d2b-11ee-85e7-ce0b8496eaa9',
    },
    {
      value: '7829cf9a-4cfd-11ee-87e2-0242ac130004',
      label: 'My custom expense',
    },
  ],
};

export const ReadOnlyView = Template.bind({});
ReadOnlyView.args = {
  pageTitle: 'Expense Detail',
  view: 'read-only',
  buttonText: 'Edit',
  ...args,
};

export const EditView = Template.bind({});
EditView.args = {
  pageTitle: 'Edit Expense',
  view: 'edit',
  buttonText: 'Update',
  ...args,
};
