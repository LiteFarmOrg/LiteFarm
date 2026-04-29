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

import type { Meta, StoryObj } from '@storybook/react';
import CropVarietySaleTile from '../../components/CropTile/CropVarietySaleTile';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/CropTile/CropVarietySaleTile',
  component: CropVarietySaleTile,
  decorators: componentDecorators,
  render: (args) => (
    <div style={{ height: '140px' }}>
      <CropVarietySaleTile {...args} />
    </div>
  ),
} as Meta<typeof CropVarietySaleTile>;

type Story = StoryObj<typeof CropVarietySaleTile>;

export const Default: Story = {
  args: {
    cropVariety: {
      crop_variety_name: 'Bluecrop',
      crop_translation_key: 'BLUEBERRY',
      crop_variety_photo_url:
        'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp',
    },
  },
};
