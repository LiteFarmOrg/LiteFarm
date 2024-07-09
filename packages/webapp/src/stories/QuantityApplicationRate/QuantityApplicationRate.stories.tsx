/*
 *  Copyright 2024 LiteFarm.org
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

import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import QuantityApplicationRate from '../../components/Task/AddSoilAmendmentProducts/QuantityApplicationRate';
import { TASK_PRODUCT_FIELD_NAMES } from '../../components/Task/AddSoilAmendmentProducts/types';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof QuantityApplicationRate> = {
  title: 'Components/QuantityApplicationRate',
  component: QuantityApplicationRate,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
    ...componentDecorators,
  ],
  args: {},
};
export default meta;

type Story = StoryObj<typeof QuantityApplicationRate>;

export const Metric: Story = {
  args: {
    system: 'metric',
    location: {
      type: 'field',
      total_area: 15200,
      total_area_unit: 'm2',
    },
  },
};

export const Imperial: Story = {
  args: {
    system: 'imperial',
    location: {
      type: 'garden',
      total_area: 15200,
      total_area_unit: 'm2',
    },
  },
};

export const ReadOnlyWeight: Story = {
  args: {
    isReadOnly: true,
    system: 'metric',
    location: {
      type: 'garden',
      total_area: 15000,
      total_area_unit: 'ha',
    },
    defaultValues: {
      [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 50,
      [TASK_PRODUCT_FIELD_NAMES.WEIGHT]: 15,
    },
  },
};

export const ReadOnlyVolume: Story = {
  args: {
    isReadOnly: true,
    system: 'metric',
    location: {
      type: 'garden',
      total_area: 15000,
      total_area_unit: 'ha',
    },
    defaultValues: {
      [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 50,
      [TASK_PRODUCT_FIELD_NAMES.VOLUME]: 15,
    },
  },
};
