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
import { componentDecorators } from '../../Pages/config/Decorators';
import { IconSummary } from '../../../components/Animals/AddAnimalsSummaryCard/IconSummary';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof IconSummary> = {
  title: 'Components/AddAnimalsSummaryCard/IconSummary',
  component: IconSummary,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof IconSummary>;

export const Animal: Story = {
  args: {
    type: 'Cattle',
    breed: 'Aberdeen',
    iconKey: 'CATTLE',
    isBatch: false,
    sexDetails: {
      Male: 3,
      Female: 7,
    },
  },
};

export const AnimalNoBreed: Story = {
  args: {
    type: 'Pig',
    iconKey: 'PIG',
    isBatch: false,
    sexDetails: {
      Male: 1,
      Female: 2,
    },
  },
};

export const Batch: Story = {
  args: {
    type: 'Cattle',
    breed: 'Aberdeen',
    isBatch: true,
    count: 3,
  },
};

export const BatchNoBreed: Story = {
  args: {
    type: 'Chicken',
    isBatch: true,
    count: 30,
  },
};

export const CustomType: Story = {
  args: {
    type: 'Guinea Pig',
    iconKey: 'CUSTOM_ANIMAL',
    isBatch: false,
    sexDetails: {
      Male: 3,
    },
  },
};
