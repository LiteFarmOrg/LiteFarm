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

import { ReactNode } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import ImagePicker, { type ImagePickerProps } from '../../containers/ImagePicker';
import { FormProvider, useController, useForm } from 'react-hook-form';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ImagePickerProps> = {
  title: 'Components/ImagePicker',
  component: ImagePicker,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { control, resetField } = useForm({ mode: 'onChange' });
      const { field } = useController({ control, name: 'image' });

      const handleSelectImage = (imageFile: any) => {
        field.onChange(imageFile);
      };

      const handleRemoveImage = () => {
        resetField('image');
      };
      const props = { label: 'Image', handleSelectImage, handleRemoveImage };
      return <Story {...props} />;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof ImagePicker>;

export const Default: Story = {
  render: (args, context) => {
    const { label, handleSelectImage, handleRemoveImage } = context;
    return (
      <ImagePicker
        label={label}
        onSelectImage={handleSelectImage}
        onRemoveImage={handleRemoveImage}
      />
    );
  },
};

export const WithDefaultUrl: Story = {
  render: (args, context) => {
    const { label, handleSelectImage, handleRemoveImage } = context;
    return (
      <ImagePicker
        label={label}
        onSelectImage={handleSelectImage}
        onRemoveImage={handleRemoveImage}
        defaultUrl="/src/assets/images/certification/Farmland.svg"
      />
    );
  },
};
