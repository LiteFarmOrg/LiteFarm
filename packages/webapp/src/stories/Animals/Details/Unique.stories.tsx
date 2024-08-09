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
import UniqueDetails, {
  UniqueDetailsProps,
} from '../../../components/Animals/AddAnimalsDetails/Unique';
import { DetailsFields, FormMethods } from '../../../components/Animals/AddAnimalsDetails/type';
import { tagTypeOptions, tagColorOptions } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<UniqueDetailsProps> = {
  title: 'Components/AddAnimalsDetails/Unique',
  component: UniqueDetails,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({ mode: 'onBlur' });
      const tagType = formMethods.watch(DetailsFields.TAG_TYPE);
      const shouldShowTagTypeInput = tagType?.label === 'Other';

      return (
        <FormProvider {...formMethods}>
          <Story t={t} shouldShowTagTypeInput={shouldShowTagTypeInput} />
        </FormProvider>
      );
    },
  ],
  // avoid "Maximum update depth exceeded" https://github.com/storybookjs/storybook/issues/12306
  parameters: { docs: { source: { type: 'code' } } },
};
export default meta;

type Story = StoryObj<typeof UniqueDetails>;

export const Unique: Story = {
  args: { tagTypeOptions, tagColorOptions },
  render: (args, context) => <UniqueDetails {...args} {...context} />,
};
