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
import Badge, { BadgeProps } from '../../components/Badge';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/Badge',
  component: Badge,
  decorators: componentDecorators,
} as Meta<typeof Badge>;

type Story = StoryObj<BadgeProps>;

export const Default: Story = {
  args: {
    title: 'Badge Title',
    content: 'This is the tooltip content.',
  },
};

export const WithLongText: Story = {
  args: {
    title: 'Badge Title',
    content:
      'This is a badge with a longer tooltip content that might wrap onto multiple lines, giving you more information about the badge!',
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Badge Title',
    content: 'This is the tooltip content.',
    showIcon: false,
  },
};

export const MenuItem: Story = {
  args: {
    title: 'Badge Title',
    content: 'This is the tooltip content.',
    showIcon: false,
    className: 'menuItem',
  },
};
