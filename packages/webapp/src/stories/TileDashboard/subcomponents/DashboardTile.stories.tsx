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
import { ReactComponent as CattleIcon } from '../../../assets/images/animals/cattle-icon.svg';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DashboardTile> = {
  title: 'Components/TileDashboard/DashboardTile',
  component: DashboardTile,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof DashboardTile>;

export const Default: Story = {
  args: {
    label: 'Cattle',
    iconName: 'CATTLE',
    count: 20,
    onClick: () => console.log('Cattle has been clicked!'),
  },
};
