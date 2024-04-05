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
import ActionMenu, { ActionMenuProps } from '../../components/ActionMenu';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ActionMenuProps> = {
  title: 'Components/ActionMenu',
  component: ActionMenu,
};
export default meta;

type Story = StoryObj<typeof ActionMenu>;

const createLabelAndOnClick = (label: string): { label: string; onClick: () => void } => {
  return {
    label,
    onClick: () => console.log(`${label} clicked!`),
  };
};

const iconActions = [
  {
    iconName: 'ADD_ANIMAL',
    ...createLabelAndOnClick('Add to group'),
  },
  {
    iconName: 'TASK_CREATION',
    ...createLabelAndOnClick('Create a task'),
  },
  { iconName: 'CLONE', ...createLabelAndOnClick('Clone') },
  {
    iconName: 'REMOVE_ANIMAL',
    ...createLabelAndOnClick('Remove animal'),
  },
];

export const Default: Story = {
  args: {
    textActions: [
      createLabelAndOnClick('Select all 152'),
      createLabelAndOnClick('Clear Selection'),
    ],
    iconActions,
    headerLeftText: '2 Selected',
  },
};

export const WithoutHeaderText: Story = {
  args: { iconActions },
};

export const WithLongIconLabels: Story = {
  args: {
    iconActions: [
      {
        iconName: 'ADD_ANIMAL',
        ...createLabelAndOnClick('Add animal long label'),
      },
      {
        iconName: 'TASK_CREATION',
        ...createLabelAndOnClick('Create a task long label'),
      },
      { iconName: 'CLONE', ...createLabelAndOnClick('Clone long label') },
      {
        iconName: 'REMOVE_ANIMAL',
        ...createLabelAndOnClick('Remove animal long label'),
      },
    ],
  },
};
