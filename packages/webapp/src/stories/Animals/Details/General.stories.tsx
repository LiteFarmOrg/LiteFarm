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

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../../Pages/config/Decorators';
import GeneralDetails, {
  GeneralDetailsProps,
} from '../../../components/Animals/Creation/Details/General';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { DetailsFields, FormMethods } from '../../../components/Animals/Creation/Details/type';
import { types, breeds, sexes, uses } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<GeneralDetailsProps> = {
  title: 'Components/Animals/Creation/Details/General',
  component: GeneralDetails,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({ mode: 'onBlur' });
      const sex = formMethods.watch(DetailsFields.SEX);
      const isMaleSelected = sex === 1;

      return <Story t={t} formMethods={formMethods} isMaleSelected={isMaleSelected} />;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof GeneralDetails>;

const commonProps = { types, breeds, sexes, uses };

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
