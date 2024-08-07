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
} from '../../../components/Animals/AddAnimalsDetails/General';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { DetailsFields, FormMethods } from '../../../components/Animals/AddAnimalsDetails/type';
import { typeOptions, breedOptions, sexOptions, useOptions } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<GeneralDetailsProps> = {
  title: 'Components/AddAnimalsDetails/General',
  component: GeneralDetails,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({ mode: 'onBlur' });
      const sex = formMethods.watch(DetailsFields.SEX);
      const isMaleSelected = sex === 1;

      return (
        <FormProvider {...formMethods}>
          <Story t={t} isMaleSelected={isMaleSelected} />
        </FormProvider>
      );
    },
  ],
  // avoid "Maximum update depth exceeded" https://github.com/storybookjs/storybook/issues/12306
  parameters: { docs: { source: { type: 'code' } } },
};
export default meta;

type Story = StoryObj<typeof GeneralDetails>;

const commonProps = { typeOptions, breedOptions, sexOptions, useOptions };

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
  },
  render: (args, context) => <GeneralDetails {...args} {...context} />,
};
