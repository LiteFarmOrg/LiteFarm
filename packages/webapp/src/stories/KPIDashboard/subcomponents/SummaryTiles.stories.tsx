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
import { SummaryTiles } from '../../../components/KPIDashboard/SummaryTiles';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof SummaryTiles> = {
  title: 'Components/PureKPIDashboard/SummaryTiles',
  component: SummaryTiles,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof SummaryTiles>;

export const Default: Story = {
  args: {
    totalCount: 100,
    categoryCount: 4,
    categoryLabel: 'Types',
  },
};
