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
import Icon from '../../../components/Icons';
import MeatballsMenu, { MeatballsMenuProps } from '../../../components/Menu/MeatballsMenu';

const meta: Meta<MeatballsMenuProps> = {
  title: 'Components/Menu/MeatballsMenu',
  component: MeatballsMenu,
  decorators: [
    (story) => {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>{story()}</div>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof MeatballsMenu>;

export const Primary: Story = {
  args: {
    options: [
      {
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon iconName="PLUS_CIRCLE" />
            Edit basic info
          </div>
        ),
        onClick: () => console.log('Edit basic info'),
      },
      {
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon iconName="PLUS_CIRCLE" />
            Remove
          </div>
        ),
        onClick: () => console.log('Remove'),
      },
    ],
  },
};
