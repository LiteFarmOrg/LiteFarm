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
import { componentDecorators } from '../Pages/config/Decorators';
import SingleFilePicker, { type SingleFilePickerProps } from '../../components/SingleFilePicker';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<SingleFilePickerProps> = {
  title: 'Components/SingleFilePicker',
  component: SingleFilePicker,
  decorators: componentDecorators,
  args: {
    label: 'Image',
    onSelectImage: () => console.log('select'),
    onRemoveImage: () => console.log('remove'),
  },
};
export default meta;

type Story = StoryObj<typeof SingleFilePicker>;

export const Default: Story = {};

export const WithDefaultUrl: Story = {
  args: {
    defaultUrl: '/src/assets/images/certification/Farmland.svg',
  },
};

export const DefaultDisabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const WithDefaultUrlDisabled: Story = {
  args: {
    defaultUrl: '/src/assets/images/certification/Farmland.svg',
    isDisabled: true,
  },
};
