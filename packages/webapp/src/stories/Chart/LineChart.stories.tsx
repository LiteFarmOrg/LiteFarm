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
import LineChart, { Color, LineChartProps, COLORS } from '../../components/Charts/LineChart';
import { formatSensorsData, getUnixTime } from '../../containers/SensorReadings/v2/utils';
import { getTicks } from '../../components/Charts/utils';
import { dailyData, multiLineData, hourlyData, singleLineData } from './dummyData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof LineChart> = {
  title: 'Components/Chart/LineChart',
  component: LineChart,
  decorators: componentDecorators,
};
export default meta;

type Story<T extends string = never> = StoryObj<LineChartProps<T>>;

export const SingleLine: Story<'month'> = {
  args: {
    title: 'Single-line',
    xAxisDataKey: 'month',
    data: singleLineData,
    lineConfig: [{ id: 'waterPotential', color: COLORS[Color.BLUE] }],
  },
};

export const MultiLine: Story<'month'> = {
  args: {
    title: 'Multi-line',
    xAxisDataKey: 'month',
    data: multiLineData,
    lineConfig: [
      { id: '5N626V', color: COLORS[Color.BLUE] },
      { id: 'BFIVBK', color: COLORS[Color.YELLOW] },
      { id: 'EBX5XQ', color: COLORS[Color.GREEN] },
      { id: '9MIVGN', color: COLORS[Color.RED] },
    ],
  },
};

export const HourlyData: Story = {
  args: {
    title: 'Hourly data',
    language: 'en',
    truncPeriod: 'hour',
    data: formatSensorsData(hourlyData, 'hour', ['LSZDWX', 'WV2JHV', '8YH5Y5', 'BWKBAL']),
    lineConfig: [
      { id: 'LSZDWX', color: COLORS[Color.BLUE] },
      { id: 'WV2JHV', color: COLORS[Color.YELLOW] },
      { id: '8YH5Y5', color: COLORS[Color.GREEN] },
      { id: 'BWKBAL', color: COLORS[Color.RED] },
    ],
    ticks: getTicks('2024-06-21', '2024-06-29', 'hour'),
  },
};

export const DailyDataUntilToday: Story = {
  args: {
    title: 'Daily data',
    language: 'en',
    data: dailyData.map((data, index) => {
      const date = new Date();
      date.setDate(date.getDate() - dailyData.length + index + 1);
      return { ...data, dateTime: getUnixTime(date) };
    }),
    lineConfig: [
      { id: 'LSZDWX', color: COLORS[Color.BLUE] },
      { id: 'WV2JHV', color: COLORS[Color.YELLOW] },
      { id: '8YH5Y5', color: COLORS[Color.GREEN] },
      { id: 'BWKBAL', color: COLORS[Color.RED] },
    ],
  },
};
