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

import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../../Pages/config/Decorators';
import Other, { OtherDetailsProps } from '../../../components/Animals/DetailCards/Other';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { FormMethods } from '../../../containers/Animals/AddAnimals/types';
import { organicStatusOptions, getOnFileUpload, addDefaults, defaultValues } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<OtherDetailsProps> = {
  title: 'Components/AddAnimalsDetails/Other',
  component: Other,
  decorators: [
    ...componentDecorators,
    (Story, { args }) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({
        mode: 'onBlur',
        defaultValues:
          args.mode === 'readonly' || args.mode === 'edit' ? defaultValues : addDefaults,
      });

      return (
        <FormProvider {...formMethods}>
          <Story t={t} />
        </FormProvider>
      );
    },
  ],
  // avoid "Maximum update depth exceeded" https://github.com/storybookjs/storybook/issues/12306
  parameters: { docs: { source: { type: 'code' } } },
};
export default meta;

type Story = StoryObj<typeof Other>;

export const Animal: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
    getOnFileUpload,
  },
  render: (args, context) => <Other {...args} {...context} />,
};

export const Batch: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    getOnFileUpload,
  },
  render: (args, context) => <Other {...args} {...context} />,
};

export const AnimalReadonly: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
    getOnFileUpload,
    mode: 'readonly',
  },
  render: (args, context) => <Other {...args} {...context} />,
};

export const BatchReadonly: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    getOnFileUpload,
    mode: 'readonly',
  },
  render: (args, context) => <Other {...args} {...context} />,
};

export const AnimalEdit: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
    getOnFileUpload,
    mode: 'edit',
  },
  render: (args, context) => <Other {...args} {...context} />,
};

export const BatchEdit: Story = {
  args: {
    organicStatusOptions,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    getOnFileUpload,
    mode: 'edit',
  },
  render: (args, context) => <Other {...args} {...context} />,
};
