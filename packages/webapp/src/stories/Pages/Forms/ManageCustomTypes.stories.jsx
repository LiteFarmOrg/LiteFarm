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
import ManageCustomTypes from '../../../components/Forms/ManageCustomTypes';

export default {
  title: 'Form/ManageCustomTypes',
  decorators: decorators,
  component: ManageCustomTypes,
};

const customTypes = [
  {
    expense_name: 'Custom type',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    expense_type_id: '461d2e5e-3d4c-11ee-ba15-e66db4bef552',
    deleted: false,
    expense_translation_key: 'CUSTOM',
    custom_description: 'A user-provided description of this type',
  },
  {
    expense_name: 'Custom type 2',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    expense_type_id: '461d2e5e-3d4c-11ee-ba15-e66db4bef553',
    deleted: false,
    expense_translation_key: 'CUSTOM_2',
    custom_description: 'A user-provided description of this type',
  },
];

export const Expense = {
  args: {
    title: 'Manage custom expense type',
    handleGoBack: () => console.log('back'),
    addLinkText: 'Add custom expense type',
    onAddType: () => console.log('add'),
    listItemData: customTypes,
    onItemClick: (key) => console.log(`${key} clicked!`),
    customTypeFieldName: 'expense_type_id',
    formatListItemData: (data) => {
      const { expense_name, expense_type_id, custom_description } = data;

      return {
        key: expense_type_id,
        iconName: 'OTHER',
        label: expense_name,
        description: custom_description,
      };
    },
    useHookFormPersist: () => ({}),
  },
  parameters: { ...chromaticSmallScreen },
};
