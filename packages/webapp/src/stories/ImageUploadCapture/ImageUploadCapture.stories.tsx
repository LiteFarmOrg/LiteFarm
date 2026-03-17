/*
 *  Copyright 2025 LiteFarm.org
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

// Mock helpers — override navigator.mediaDevices for each story
const mockEnumerateDevices = (devices: MediaDeviceInfo[]) => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { enumerateDevices: () => Promise.resolve(devices) },
    writable: true,
    configurable: true,
  });
};

/** Single "Photo library" tile — no camera detected on the device */
export const NoCamera: Story = {
  beforeEach: () => {
    mockEnumerateDevices([]);
  },
};

/** Two tiles — "Photo library" + "Take photo" — camera detected */
export const WithCamera: Story = {
  beforeEach: () => {
    mockEnumerateDevices([
      { kind: 'videoinput', deviceId: '', groupId: '', label: '', toJSON: () => ({}) },
    ]);
  },
};

/** Preview state — an image has already been selected */
export const WithPreview: Story = {
  beforeEach: () => {
    mockEnumerateDevices([]);
  },
  args: {
    selectedImageUrl: '/src/assets/images/certification/Farmland.svg',
  },
};
