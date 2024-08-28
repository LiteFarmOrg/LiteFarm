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

import { ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import { AddAnimalsSummaryCard } from '../../components/Animals/AddAnimalsSummaryCard';
import styles from './styles.module.scss';
import { AnimalSummary } from '../../components/Animals/AddAnimalsSummaryCard/types';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof AddAnimalsSummaryCard> = {
  title: 'Components/AddAnimalsSummaryCard',
  component: AddAnimalsSummaryCard,
  decorators: [
    (Story) => (
      <ResizeWrapper>
        <Story />
      </ResizeWrapper>
    ),
    ...componentDecoratorsWithoutPadding,
  ],
};
export default meta;

interface ResizeWrapperProps {
  children: ReactNode;
}

const ResizeWrapper = ({ children }: ResizeWrapperProps) => {
  return <div className={styles.wrapper}>{children}</div>;
};

type Story = StoryObj<typeof AddAnimalsSummaryCard>;

const animalsInfo: AnimalSummary[] = [
  {
    type: 'Cattle',
    breed: 'Aberdeen',
    sexDetails: { Male: 3, Female: 4 },
    iconKey: 'CATTLE',
  },
  {
    type: 'Chicken',
    sexDetails: { Male: 3, Female: 3 },
    iconKey: 'CHICKEN',
  },
  {
    type: 'Guinea Pig',
    sexDetails: { Male: 4 },
    /* @ts-ignore */
    iconKey: 'GUINEA_PIG', // non-existent keys will default to CUSTOM_ANIMAL icon
  },
];
const batchInfo = [{ type: 'Chicken', breed: 'Plymouth Rock', count: 1238 }];

export const Default: Story = {
  args: {
    animalsInfo,
    batchInfo,
    onContinue: () => {
      console.log('Routing to inventory');
    },
  },
};

export const OnlyAnimals: Story = {
  args: {
    animalsInfo,
    onContinue: () => {
      console.log('Routing to inventory');
    },
  },
};

export const OnlyBatches: Story = {
  args: {
    batchInfo,
    onContinue: () => {
      console.log('Routing to inventory');
    },
  },
};
