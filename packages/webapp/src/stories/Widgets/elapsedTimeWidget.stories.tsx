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
import ElapsedTimeWidget, { ElapsedTimeWidgetProps } from '../../components/Widgets/ElapsedTime';

const Template = ({ pastDate }: ElapsedTimeWidgetProps) => (
  <ElapsedTimeWidget pastDate={pastDate} />
);

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<ElapsedTimeWidgetProps> = {
  title: 'Components/Widgets/ElapsedTimeWidget',
  component: ElapsedTimeWidget,
  decorators: [...componentDecorators],
};
export default meta;

type Story = StoryObj<typeof Template>;

const THREE_MINS_IN_MS = 3 * 60 * 1000;
const THREE_HRS_IN_MS = 3 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
const THREE_WEEKS_IN_MS = 3 * 7 * 24 * 60 * 60 * 1000;
const THREE_MONTHS_IN_MS = 3 * 12 * 7 * 24 * 60 * 60 * 1000;
const THREE_YEARS_IN_MS = 3 * 52 * 12 * 7 * 24 * 60 * 60 * 1000;

export const NoData: Story = {
  args: {
    pastDate: undefined,
  },
};

export const ThreeMinutesAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_MINS_IN_MS),
  },
};

export const ThreeHoursAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_HRS_IN_MS),
  },
};

export const ThreeHoursAndThreeMinutesAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_HRS_IN_MS - THREE_MINS_IN_MS),
  },
};

export const ThreeDaysAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_DAYS_IN_MS),
  },
};

export const ThreeWeeksAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_WEEKS_IN_MS),
  },
};

export const ThreeMonthsAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_MONTHS_IN_MS),
  },
};

export const ThreeYearsAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - THREE_YEARS_IN_MS),
  },
};
