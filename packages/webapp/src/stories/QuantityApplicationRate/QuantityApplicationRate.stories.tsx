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
import { FormProvider, useForm } from 'react-hook-form';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof QuantityApplicationRate> = {
  title: 'Components/QuantityApplicationRate',
  component: QuantityApplicationRate,
  decorators: [
    (Story, context) => {
      const methods = useForm({
        defaultValues: { ...context.parameters.formDefaultValues },
      });
      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    },
    ...componentDecorators,
  ],
  args: {},
};
export default meta;

type Story = StoryObj<typeof QuantityApplicationRate>;

export const Metric: Story = {
  args: {
    system: 'metric',
    locations: [
      {
        type: 'field',
        total_area: 15000,
        total_area_unit: 'm2',
      },
    ],
  },
};

export const Imperial: Story = {
  args: {
    system: 'imperial',
    locations: [
      {
        type: 'garden',
        total_area: 15000,
        total_area_unit: 'm2',
      },
    ],
  },
};

export const MultipleLocations: Story = {
  args: {
    system: 'metric',
    locations: [
      {
        type: 'field',
        total_area: 10000,
        total_area_unit: 'm2',
      },
      {
        type: 'garden',
        total_area: 500,
        total_area_unit: 'm2',
      },
      {
        type: 'field',
        total_area: 10000,
        total_area_unit: 'm2',
      },
    ],
  },
};

export const ReadOnlyWeight: Story = {
  args: {
    isReadOnly: true,
    system: 'metric',
    locations: [
      {
        type: 'garden',
        total_area: 15000,
        total_area_unit: 'ha',
      },
    ],
  },
  parameters: {
    formDefaultValues: {
      [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 50,
      [TASK_PRODUCT_FIELD_NAMES.WEIGHT]: 15,
      [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT]: 20,
    },
  },
};

export const ReadOnlyVolume: Story = {
  args: {
    isReadOnly: true,
    system: 'metric',
    locations: [
      {
        type: 'garden',
        total_area: 15000,
        total_area_unit: 'ha',
      },
    ],
  },
  parameters: {
    formDefaultValues: {
      [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 50,
      [TASK_PRODUCT_FIELD_NAMES.VOLUME]: 15,
      [TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME]: 20,
    },
  },
};
