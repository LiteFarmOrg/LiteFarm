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

import type { Meta, StoryObj } from '@storybook/react';
import LockedInputRHF from '../../../components/Form/LockedInput';
import { componentDecorators } from '../../Pages/config/Decorators';
import { FormProvider, useForm } from 'react-hook-form';

const meta: Meta<typeof LockedInputRHF> = {
  title: 'Components/LockedInput',
  component: LockedInputRHF,
  args: {},
  decorators: [
    ...componentDecorators,
    (Story) => {
      const methods = useForm({});
      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Locked', placeholder: 'Test' },
  render: (args) => {
    return <LockedInputRHF {...args} />;
  },
};
