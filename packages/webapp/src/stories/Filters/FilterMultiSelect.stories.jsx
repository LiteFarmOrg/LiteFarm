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

import { componentDecorators } from '../Pages/config/Decorators';
import { FilterMultiSelect } from '../../components/Filter/FilterMultiSelect';

const props = {
  subject: 'Status',
  options: [
    {
      value: 'active',
      default: false,
      label: 'Active',
    },
    {
      value: 'planned',
      default: false,
      label: 'Planned',
    },
    {
      value: 'complete',
      default: false,
      label: 'Complete',
    },
    {
      value: 'abandoned',
      default: false,
      label: 'Abandoned',
    },
    {
      value: 'needs_plan',
      default: false,
      label: 'Needs plan',
    },
  ],
  onChange: () => {
    console.log('onChange fired!');
  },
  shouldReset: 0,
};

export default {
  title: 'Components/Filters/FilterMultiSelect',
  component: FilterMultiSelect,
  decorators: componentDecorators,
  args: {
    ...props,
  },
};

export const Default = {};

export const Disabled = {
  args: {
    isDisabled: true,
  },
};
