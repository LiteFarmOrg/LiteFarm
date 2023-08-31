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
import ExpenseItemsForTypes from '../../../components/Finances/ExpenseItemsForTypes';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Finance/ExpenseItemsForTypes',
  decorators: decorators,
  component: ExpenseItemsForTypes,
};

export const Primary = {
  args: {
    types: [
      { name: 'Equipment', id: '1fd85a60-22a9-11ee-9683-e66db4bef552' },
      { name: 'Fuel', id: '1fd86136-22a9-11ee-9683-e66db4bef552' },
      { name: 'Land', id: '1fd86168-22a9-11ee-9683-e66db4bef552' },
    ],
    setExpenseDetail: () => ({}),
    setIsValid: () => ({}),
  },
  parameters: { ...chromaticSmallScreen },
};
