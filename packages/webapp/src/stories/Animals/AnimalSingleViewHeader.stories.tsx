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
    locationText: 'Pig House',
    animalOrBatch: mockAnimal1,
  },
};

export const AnimalWithoutPhoto: Story = {
  args: {
    locationText: 'Pig House',
    animalOrBatch: { ...mockAnimal1, photo_url: null },
  },
};

export const AnimalWithoutLocation: Story = {
  args: {
    animalOrBatch: mockAnimal1,
  },
};

export const AnimalWithoutAge: Story = {
  args: {
    locationText: 'Pig House',
    animalOrBatch: { ...mockAnimal1, birth_date: null },
  },
};

export const AnimalWithLongTexts: Story = {
  args: {
    locationText: 'Pig House ABCDEFG',
    animalOrBatch: { ...mockAnimal2, birth_date: null },
  },
};

export const EditMode: Story = {
  args: {
    locationText: 'Pig House',
    animalOrBatch: mockAnimal1,
    isEditing: true,
  },
};

export const EditModeWithLongText: Story = {
  args: {
    locationText: 'Pig House ABCDEFG',
    animalOrBatch: { ...mockAnimal2, birth_date: null },
    isEditing: true,
  },
};

export const BatchHeader: Story = {
  args: {
    locationText: 'Chicken coop',
    animalOrBatch: mockBatch1,
  },
};
