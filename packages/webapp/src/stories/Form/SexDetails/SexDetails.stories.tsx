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

import SexDetails from '../../../components/Form/SexDetails';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../../Pages/config/Decorators';
import { Controller, useForm } from 'react-hook-form';

const meta: Meta<typeof SexDetails> = {
  title: 'Form/SexDetails',
  component: SexDetails,
  decorators: [...componentDecorators],
  args: {
    maxCount: 100,
  },
  render: (args) => {
    const { control } = useForm();
    return (
      <Controller
        name="name"
        control={control}
        defaultValue={args.initialDetails}
        render={({ field }) => (
          <SexDetails
            {...args}
            initialDetails={field.value}
            onConfirm={(details) => field.onChange(details)}
          />
        )}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof SexDetails>;

const createInitialDetails = (...details: string[]) =>
  details.map((label, i) => ({ id: i, label, count: 0 }));

export const Primary: Story = {
  args: {
    initialDetails: createInitialDetails('Male', 'Female'),
  },
};

export const MultipleSexes: Story = {
  args: {
    initialDetails: createInitialDetails('Bull', 'Cow', 'Heifer', 'Steer', 'Calf'),
  },
};
