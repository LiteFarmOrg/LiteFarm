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
import ImageUploadCapture, {
  type ImageUploadCaptureProps,
} from '../../components/ImageUploadCapture';

const meta: Meta<ImageUploadCaptureProps> = {
  title: 'Components/ImageUploadCapture',
  component: ImageUploadCapture,
  decorators: componentDecorators,
  args: {
    onSelectImage: (file) => console.log('select', file.name),
    onRemoveImage: () => console.log('remove'),
  },
};
export default meta;

type Story = StoryObj<typeof ImageUploadCapture>;

// Mock helper — override navigator.userAgentData for getDeviceType()
const mockPlatform = (platform: 'macOS' | 'iOS') => {
  Object.defineProperty(navigator, 'userAgentData', {
    value: { platform, mobile: platform !== 'macOS' },
    configurable: true,
  });
};

/** Single "Photo library" tile */
export const Desktop: Story = {
  beforeEach: () => {
    mockPlatform('macOS');
  },
};

/** Two tiles — "Photo library" + "Take photo" */
export const Mobile: Story = {
  beforeEach: () => {
    mockPlatform('iOS');
  },
};

/** Preview state — an image has already been selected */
export const WithPreview: Story = {
  beforeEach: () => {
    mockPlatform('macOS');
  },
  args: {
    defaultUrl: '/src/assets/images/certification/Farmland.svg',
  },
};
