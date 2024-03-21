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
import FilterGroup from '../../components/Filter/FilterGroup';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const filters = [
  {
    subject: 'Status',
    filterKey: 'Status',
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
  },
  {
    subject: 'Location',
    filterKey: 'Location',
    options: [
      {
        value: 'Buffer Zone 1',
        default: false,
        label: 'Buffer Zone 1',
      },
      {
        value: 'Buffer Zone 2',
        default: false,
        label: 'Buffer Zone 2',
      },
      {
        value: 'Field 1',
        default: false,
        label: 'Field 1',
      },
      {
        value: 'Field 2',
        default: false,
        label: 'Field 2',
      },
      {
        value: 'Field 3',
        default: false,
        label: 'Field 3',
      },
      {
        value: 'Field 4',
        default: false,
        label: 'Field 4',
      },
      {
        value: 'Field 5',
        default: false,
        label: 'Field 5',
      },
      {
        value: 'Greenhouse 1',
        default: false,
        label: 'Greenhouse 1',
      },
      {
        value: 'Greenhouse 2',
        default: false,
        label: 'Greenhouse 2',
      },
      {
        value: 'Veggie Garden',
        default: false,
        label: 'Veggie Garden',
      },
    ],
  },
  {
    subject: 'Suppliers',
    filterKey: 'Suppliers',
    options: [
      {
        value: 'Supplier 1',
        default: false,
        label: 'Supplier 1',
      },
      {
        value: 'Supplier 2',
        default: false,
        label: 'Supplier 2',
      },
      {
        value: 'Supplier 3',
        default: false,
        label: 'Supplier 3',
      },
    ],
  },
];

export default {
  title: 'Components/Filters/FilterGroup',
  component: FilterGroup,
  decorators: componentDecorators,
  args: {
    filters,
    onChange: () => {
      console.log('onChange fired!');
    },
    shouldReset: 0,
  },
};

export const Default = {};

export const IndividualFilterControls = {
  args: {
    showIndividualFilterControls: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAllButton = canvas.getAllByText('Select all')[0];
    await userEvent.click(selectAllButton);
    await expect(canvas.queryByText(filters[0].options.length)).toBeVisible();
    const clearAllButton = canvas.getAllByText('Clear all')[0];
    await userEvent.click(clearAllButton);
    await expect(canvas.queryByText(filters[0].options.length)).toBeNull();
  },
};
