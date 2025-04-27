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

import { Meta, StoryObj } from '@storybook/react/*';
import styles from './styles.module.scss';
import { DateInput } from '../../../components/Inputs/DateTime';
import { componentDecorators } from '../../Pages/config/Decorators';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DateInput> = {
  title: 'Components/Form/DateInput',
  component: DateInput,
  decorators: [
    ...componentDecorators,
    (Story) => {
      return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Story />
        </LocalizationProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof DateInput>;

const mockDate = new Date('2025-04-16');
const mockDateIso = mockDate.toISOString();

export const Default: Story = {
  args: {
    date: mockDate,
  },
};

export const Disabled: Story = {
  args: {
    date: mockDate,
    disabled: true,
  },
};

// adapterMoment is fine with Date object or ISO string
export const WithIsoDate: Story = {
  args: {
    date: mockDateIso,
  },
};

export const WithLabel: Story = {
  args: {
    date: mockDate,
    label: 'Start date',
  },
};

export const WithStyleClass: Story = {
  args: {
    date: mockDate,
    label: 'Start date',
    className: styles.inputContainer,
  },
};

export const WithLabelProps: Story = {
  args: {
    date: mockDate,
    label: 'Start date',
    hasLeaf: true,
    labelStyles: {
      color: 'olive',
      fontSize: '16px',
      fontWeight: '700',
      paddingBottom: '8px',
    },
  },
};
