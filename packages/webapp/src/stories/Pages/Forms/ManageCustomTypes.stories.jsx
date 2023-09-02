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
import { ReactComponent as OtherIcon } from '../../../assets/images/log/other.svg';

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
  },
  {
    expense_name: 'Custom type 2',
    farm_id: '474069c6-22a9-11ee-a59f-e66db4bef552',
    expense_type_id: '461d2e5e-3d4c-11ee-ba15-e66db4bef553',
    deleted: false,
    expense_translation_key: 'CUSTOM_2',
  },
];

export const Expense = {
  args: {
    title: 'Manage custom expense type',
    handleGoBack: () => console.log('back'),
    addLinkText: 'Add custom expense type',
    onAddType: () => console.log('add'),
    tileData: customTypes,
    onTileClick: (key) => console.log(`${key} clicked!`),
    customTypeFieldName: 'expense_type_id',
    formatTileData: (data) => {
      const { expense_name, expense_type_id } = data;

      return {
        key: expense_type_id,
        tileKey: expense_type_id,
        icon: <OtherIcon />,
        label: expense_name,
      };
    },
    useHookFormPersist: () => ({}),
  },
  parameters: { ...chromaticSmallScreen },
};
