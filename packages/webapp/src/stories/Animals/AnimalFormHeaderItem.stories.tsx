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
import { AnimalFormHeaderItem } from '../../components/Animals/AddAnimalsForm/AnimalFormHeaderItem';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof AnimalFormHeaderItem> = {
  title: 'Components/Animals/AnimalFormHeaderItem',
  component: AnimalFormHeaderItem,
  decorators: componentDecorators,
  args: {
    isExpanded: true,
    onRemove: () => console.log('removing'),
  },
};
export default meta;

type Story = StoryObj<typeof AnimalFormHeaderItem>;

export const Animal: Story = {
  args: {
    type: 'Cattle',
    breed: 'Aberdeen',
    iconKey: 'CATTLE',
    isBatch: false,
    sex: 'Female',
    number: 4,
    totalCount: 7,
  },
};

export const AnimalNoBreed: Story = {
  args: {
    type: 'Pig',
    iconKey: 'PIG',
    isBatch: false,
    sex: 'Female',
    number: 7,
    totalCount: 7,
  },
};

export const AnimalNoSex: Story = {
  args: {
    type: 'Pig',
    breed: 'Yorkshire',
    iconKey: 'PIG',
    isBatch: false,
    number: 7,
    totalCount: 7,
  },
};

export const Batch: Story = {
  args: {
    type: 'Chicken',
    breed: 'Plymouth Rock',
    iconKey: 'CHICKEN',
    isBatch: true,
    count: 1238,
    number: 1,
    totalCount: 2,
  },
};

export const BatchNoBreed: Story = {
  args: {
    type: 'Chicken',
    iconKey: 'CHICKEN',
    isBatch: true,
    count: 30,
    number: 2,
    totalCount: 2,
    onRemove: () => console.log('removing'),
  },
};

export const LongNameAnimal: Story = {
  args: {
    type: 'Guinea Pig',
    breed: 'English Crested',
    sex: 'Female',
    iconKey: 'CUSTOM_ANIMAL',
    isBatch: false,
    number: 1,
    totalCount: 1,
  },
};

export const LongNameBatch: Story = {
  args: {
    type: 'Guinea Pig',
    breed: 'English Crested',
    iconKey: 'CUSTOM_ANIMAL',
    isBatch: true,
    count: 1357,
    number: 1,
    totalCount: 1,
  },
};

export const WithoutRemove: Story = {
  args: {
    type: 'Guinea Pig',
    breed: 'English Crested',
    iconKey: 'CUSTOM_ANIMAL',
    isBatch: true,
    count: 1357,
    number: 1,
    totalCount: 1,
    showRemove: false,
  },
};
