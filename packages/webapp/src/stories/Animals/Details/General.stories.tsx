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
import GeneralDetails, {
  GeneralDetailsProps,
} from '../../../components/Animals/DetailCards/General';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { FormMethods } from '../../../containers/Animals/AddAnimals/types';

import {
  typeOptions,
  breedOptions,
  sexOptions,
  sexDetailsOptions,
  useOptions,
  defaultValues,
} from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<GeneralDetailsProps> = {
  title: 'Components/AddAnimalsDetails/General',
  component: GeneralDetails,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({
        mode: 'onBlur',
        defaultValues,
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

type Story = StoryObj<typeof GeneralDetails>;

const commonProps = { sexOptions, useOptions };

export const Animal: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};

export const Batch: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    sexDetailsOptions,
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};

export const AnimalReadOnly: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
    mode: 'readonly',
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};

export const BatchReadOnly: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    sexDetailsOptions,
    mode: 'readonly',
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};

export const AnimalEdit: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.ANIMAL,
    mode: 'edit',
    typeOptions,
    breedOptions,
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};

export const BatchEdit: Story = {
  args: {
    ...commonProps,
    animalOrBatch: AnimalOrBatchKeys.BATCH,
    sexDetailsOptions,
    mode: 'edit',
    typeOptions,
    breedOptions,
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};
