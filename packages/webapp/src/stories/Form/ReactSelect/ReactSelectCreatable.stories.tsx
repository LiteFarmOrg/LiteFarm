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
import { CreatableSelect } from '../../../components/Form/ReactSelect';
import { componentDecorators } from '../../Pages/config/Decorators';
import { options } from './options';

const meta: Meta<typeof CreatableSelect> = {
  title: 'Components/ReactSelect/Creatable',
  component: CreatableSelect,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
  },
};
