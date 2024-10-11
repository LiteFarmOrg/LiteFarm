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
import AnimalSingleViewHeader, {
  AnimalSingleViewHeaderProps,
} from '../../components/Animals/AnimalSingleViewHeader';
import {
  mockAnimal1,
  mockAnimal2,
  mockBatch1,
  mockCustomAnimalBreeds,
  mockCustomAnimalTypes,
  mockDefaultAnimalBreeds,
  mockDefaultAnimalTypes,
} from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<AnimalSingleViewHeaderProps> = {
  title: 'Components/Animals/AnimalSingleViewHeader',
  component: AnimalSingleViewHeader,
  decorators: componentDecorators,
  args: {
    onRemove: () => console.log('removing'),
    onEdit: () => console.log('edit mode'),
    onBack: () => console.log('back'),
    defaultTypes: mockDefaultAnimalTypes,
    customTypes: mockCustomAnimalTypes,
    defaultBreeds: mockDefaultAnimalBreeds,
    customBreeds: mockCustomAnimalBreeds,
  },
};
export default meta;

type Story = StoryObj<typeof AnimalSingleViewHeader>;

export const AnimalHeader: Story = {
  args: {
    animalOrBatch: { ...mockAnimal1, location: 'Pig House' },
  },
};

export const AnimalWithoutPhoto: Story = {
  args: {
    animalOrBatch: { ...mockAnimal1, location: 'Pig House', photo_url: null },
  },
};

export const AnimalWithoutLocation: Story = {
  args: {
    animalOrBatch: { ...mockAnimal1, location: undefined, photo_url: null },
  },
};

export const AnimalWithLongTexts: Story = {
  args: {
    animalOrBatch: { ...mockAnimal2, location: 'Pig House ABCDEFG' },
  },
};

export const EditMode: Story = {
  args: {
    animalOrBatch: { ...mockAnimal1, location: 'Pig House' },
    isEditing: true,
  },
};

export const EditModeWithLongText: Story = {
  args: {
    animalOrBatch: { ...mockAnimal2, location: 'Pig House ABCDEFG' },
    isEditing: true,
  },
};

export const BatchHeader: Story = {
  args: {
    animalOrBatch: { ...mockBatch1, location: 'Chicken coop' },
  },
};
