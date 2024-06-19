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
import SmallButton from '../../components/Form/Button/SmallButton';
import { componentDecorators } from '../Pages/config/Decorators';

const meta: Meta<typeof SmallButton> = {
  title: 'Components/Button/SmallButton',
  component: SmallButton,
  decorators: componentDecorators,
};

export default meta;

type Story = StoryObj<typeof SmallButton>;

export const Default: Story = {
  args: {
    children: 'button',
    onClick: () => console.log('Clicked!'),
  },
};

export const RemoveButton: Story = {
  args: {
    variant: 'remove',
    onClick: () => console.log('Removed!'),
  },
};
