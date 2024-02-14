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
import { DashboardTile } from '../../../components/TileDashboard/DashboardTile';
import { ReactComponent as CattleIcon } from '../../../assets/images/animals/cattle-icon-btn-list.svg';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DashboardTile> = {
  title: 'Components/PureTileDashboard/DashboardTile',
  component: DashboardTile,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof DashboardTile>;

export const Default: Story = {
  args: {
    label: 'Cattle',
    icon: <CattleIcon />,
    count: 20,
    onClick: () => console.log('Cattle has been clicked!'),
  },
};

export const LongType: Story = {
  args: {
    label: 'Tasmanian Devil',
    icon: <CattleIcon />,
    count: 20,
    onClick: () => console.log('Tasmanian Devil has been clicked!'),
  },
};
