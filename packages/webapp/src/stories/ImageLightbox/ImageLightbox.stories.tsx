/*
 *  Copyright 2026 LiteFarm.org
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
import ImageLightbox, { type ImageLightboxProps } from '../../components/ImageLightbox';

const meta: Meta<ImageLightboxProps> = {
  title: 'Components/ImageLightbox',
  component: ImageLightbox,
  decorators: componentDecorators,
  args: {
    src: '/src/assets/images/certification/Farmland.svg',
    open: true,
    onClose: () => console.log('close'),
  },
};
export default meta;

type Story = StoryObj<typeof ImageLightbox>;

export const Open: Story = {};

export const Closed: Story = {
  args: {
    open: false,
  },
};
