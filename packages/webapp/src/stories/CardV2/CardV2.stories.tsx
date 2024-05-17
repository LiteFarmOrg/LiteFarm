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

import type { Meta, StoryObj } from '@storybook/react';

import { componentDecorators } from '../Pages/config/Decorators';
import Card from '../../components/CardV2/index';

const meta: Meta<typeof Card> = {
  title: 'Components/CardV2',
  component: Card,
  decorators: componentDecorators,
  args: {
    children: (
      <div>
        <h4>Card heading</h4>
        <br />
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis, harum! Quasi iste ex
          repudiandae. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga ab aperiam
          totam.
        </p>
        <br />
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias, quas!</p>
      </div>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {},
};

export const Active: Story = {
  args: { isActive: true },
};
