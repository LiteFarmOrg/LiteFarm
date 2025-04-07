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

const ThreeMinsInMS = 3 * 60 * 1000;
const ThreeHrsInMS = 3 * 60 * 60 * 1000;
const ThreeDaysInMS = 3 * 24 * 60 * 60 * 1000;
const ThreeWeeksInMS = 3 * 7 * 24 * 60 * 60 * 1000;
const ThreeMonthsInMS = 3 * 12 * 7 * 24 * 60 * 60 * 1000;
const ThreeYearsInMS = 3 * 52 * 12 * 7 * 24 * 60 * 60 * 1000;

export const ThreeMinutesAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeMinsInMS),
  },
};

export const ThreeHoursAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeHrsInMS),
  },
};

export const ThreeHoursAndThreeMinutesAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeHrsInMS - ThreeMinsInMS),
  },
};

export const ThreeDaysAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeDaysInMS),
  },
};

export const ThreeWeeksAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeWeeksInMS),
  },
};

export const ThreeMonthsAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeMonthsInMS),
  },
};

export const ThreeYearsAgo: Story = {
  args: {
    pastDate: new Date(Date.now() - ThreeYearsInMS),
  },
};
