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
import UniqueDetails, {
  UniqueDetailsProps,
} from '../../../components/Animals/Creation/Details/Unique';
import { DetailsFields, FormMethods } from '../../../components/Animals/Creation/Details/type';
import { tagTypes, tagColors, tagPlacements } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<UniqueDetailsProps> = {
  title: 'Components/Animals/Creation/Details/Unique',
  component: UniqueDetails,
  decorators: [
    ...componentDecorators,
    (Story) => {
      const { t } = useTranslation();
      const formMethods: FormMethods = useForm({ mode: 'onBlur' });
      const tagType = formMethods.watch(DetailsFields.TAG_TYPE);
      const tagPlacement = formMethods.watch(DetailsFields.TAG_PLACEMENT);
      const shouldShowTagTypeInput = tagType?.label === 'Other';
      const shouldShowTagPlacementInput = tagPlacement?.label === 'Other';

      return (
        <Story
          t={t}
          formMethods={formMethods}
          shouldShowTagTypeInput={shouldShowTagTypeInput}
          shouldShowTagPlacementInput={shouldShowTagPlacementInput}
        />
      );
    },
  ],
  // avoid "Maximum update depth exceeded" https://github.com/storybookjs/storybook/issues/12306
  parameters: { docs: { source: { type: 'code' } } },
};
export default meta;

type Story = StoryObj<typeof UniqueDetails>;

export const Unique: Story = {
  args: { tagTypes, tagColors, tagPlacements },
  render: (args, context) => <UniqueDetails {...args} {...context} />,
};
