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
import InFormButtons from '../../components/Form/InFormButtons';
import { componentDecorators } from '../Pages/config/Decorators';

const meta: Meta<typeof InFormButtons> = {
  title: 'Components/InFormButtons',
  component: InFormButtons,
  decorators: componentDecorators,
  args: {
    statusText: 'Editing...',
    onCancel: () => console.log('Cancelled!'),
    onConfirm: () => console.log('Confirmed!'),
    confirmText: 'Save product',
    informationalText: 'Any changes will affect all tasks involving this product ',
  },
};

export default meta;

type Story = StoryObj<typeof InFormButtons>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};
