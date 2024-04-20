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
import Origin, { OriginProps } from '../../../components/Animals/AddAnimalsDetails/Origin';
import { AnimalOrigins } from '../../../containers/Animals/types';
import { DetailsFields, FormMethods } from '../../../components/Animals/AddAnimalsDetails/type';
import { originOptions } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<OriginProps> = {
  title: 'Components/AddAnimalsDetails/Origin',
  component: Origin,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({ mode: 'onBlur' });
      const originId = formMethods.watch(DetailsFields.ORIGIN);
      const origin = !originId
        ? undefined
        : originId === 1
          ? AnimalOrigins.BROUGHT_IN
          : AnimalOrigins.BORN_AT_FARM;

      return <Story t={t} formMethods={formMethods} origin={origin} />;
    },
  ],
  // avoid "Maximum update depth exceeded" https://github.com/storybookjs/storybook/issues/12306
  parameters: { docs: { source: { type: 'code' } } },
};
export default meta;

type Story = StoryObj<typeof Origin>;

export const OriginDetails: Story = {
  args: { currency: '$', originOptions },
  render: (args, context) => <Origin {...args} {...context} />,
};
