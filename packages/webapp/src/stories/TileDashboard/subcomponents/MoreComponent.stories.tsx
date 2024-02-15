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
import { MoreComponent } from '../../../components/TileDashboard/MoreComponent';
import { mockTiles } from '../mockTiles';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof MoreComponent> = {
  title: 'Components/TileDashboard/MoreComponent',
  component: MoreComponent,
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <div style={{ width: '200px', marginLeft: 'auto' }}>
          <Story />
        </div>
      </div>
    ),
    ...componentDecorators,
  ],
};
export default meta;

type Story = StoryObj<typeof MoreComponent>;

export const Default: Story = {
  args: {
    moreIconTiles: mockTiles.slice(0, 4).map((tile, index) => ({ ...tile, id: index })),
  },
};

export const Selected: Story = {
  args: {
    moreIconTiles: mockTiles.slice(0, 4).map((tile, index) => ({ ...tile, id: index })),
    selectedFilterIds: [0, 3],
  },
};
