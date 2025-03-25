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
import LineChart, { LineChartProps } from '../../components/Charts/LineChart';
import { getTicks, getUnixTime } from '../../components/Charts/utils';
import { colors } from '../../assets/theme';
import { getLocalDateInYYYYDDMM } from '../../util/date';
import { singleLineData, multiLineData, timeScaleData1, timeScaleData2 } from './mockData';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof LineChart> = {
  title: 'Components/Chart/LineChart',
  component: LineChart,
  decorators: componentDecorators,
};
export default meta;

type Story<T extends string = never> = StoryObj<LineChartProps<T>>;

export const GeneralDataSingleLine: Story<'month'> = {
  args: {
    title: 'Single-line',
    xAxisDataKey: 'month',
    data: singleLineData,
    lineConfig: [{ id: 'waterPotential', color: colors.chartBlue }],
  },
};

export const GeneralDataMultiLine: Story<'month'> = {
  args: {
    title: 'Multi-line',
    xAxisDataKey: 'month',
    data: multiLineData,
    lineConfig: [
      { id: 'A', color: colors.chartBlue },
      { id: 'B', color: colors.chartYellow },
      { id: 'C', color: colors.chartGreen },
      { id: 'D', color: colors.chartRed },
    ],
  },
};

const hourlyDataArgs: LineChartProps = {
  title: 'Hourly data',
  language: 'en',
  truncPeriod: 'hour',
  data: timeScaleData1.map((data, index) => ({
    ...data,
    dateTime: new Date(2024, 5, 14, index).getTime() / 1000,
  })),
  lineConfig: [
    { id: 'A', color: colors.chartBlue },
    { id: 'B', color: colors.chartYellow },
    { id: 'C', color: colors.chartGreen },
    { id: 'D', color: colors.chartRed },
  ],
  ticks: getTicks('2024-06-14', '2024-06-16'),
  formatTooltipValue: (_label, value) => {
    return typeof value === 'number' ? `${value.toFixed(2)}kPA` : '';
  },
};

export const HourlyDataSingleLine: Story = {
  args: {
    ...hourlyDataArgs,
    lineConfig: [{ id: 'B', color: colors.chartYellow }],
  },
};

export const HourlyDataMultiLines: Story = {
  args: hourlyDataArgs,
};

export const HourlyDataCompactView: Story = {
  args: {
    ...hourlyDataArgs,
    isCompactView: true,
  },
};

// 2024-05-31 - 2024-06-28
const dataLength = timeScaleData2.length; // Adjust this to change the duration shown on the chart
export const DailyData: Story = {
  args: {
    title: 'Daily data',
    language: 'en',
    data: timeScaleData2.slice(0, dataLength).map((data, index) => {
      return { ...data, dateTime: getUnixTime(new Date(2024, 4, 31 + index)) };
    }),
    lineConfig: [
      { id: 'A', color: colors.chartBlue },
      { id: 'B', color: colors.chartYellow },
      { id: 'C', color: colors.chartGreen },
      { id: 'D', color: colors.chartRed },
    ],
    ticks: getTicks('2024-05-31', getLocalDateInYYYYDDMM(new Date(2024, 4, 31 + dataLength - 1))),
    formatTooltipValue: (_label, value) => {
      return typeof value === 'number' ? `${value.toFixed(2)}°F` : '';
    },
  },
};

// 6 days ago - today
export const DailyDataUntilToday: Story = {
  args: {
    title: 'Daily data',
    language: 'en',
    data: timeScaleData2.slice(-7).map((data, index) => {
      const date = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 6 + index,
      );
      return { ...data, dateTime: getUnixTime(date) };
    }),
    lineConfig: [
      { id: 'A', color: colors.chartBlue },
      { id: 'B', color: colors.chartYellow },
      { id: 'C', color: colors.chartGreen },
      { id: 'D', color: colors.chartRed },
    ],
    ticks: getTicks(
      getLocalDateInYYYYDDMM(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6),
      ),
      getLocalDateInYYYYDDMM(),
    ),
    formatTooltipValue: (_label, value) => {
      return typeof value === 'number' ? `${value.toFixed(2)}°C` : '';
    },
  },
};

// 2025-02-01 -
export const DailyDataWithMonthlyTicks: Story = {
  args: {
    title: 'Daily data',
    language: 'en',
    data: timeScaleData1.map((data, index) => {
      return { ...data, dateTime: getUnixTime(new Date(2025, 1, 1 + index)) };
    }),
    lineConfig: [
      { id: 'A', color: colors.chartBlue },
      { id: 'B', color: colors.chartYellow },
      { id: 'C', color: colors.chartGreen },
      { id: 'D', color: colors.chartRed },
    ],
    ticks: getTicks('2025-02-01', getLocalDateInYYYYDDMM(new Date(2025, 1, timeScaleData1.length))),
    formatTooltipValue: (_label, value) => {
      return typeof value === 'number' ? `${value.toFixed(2)}°F` : '';
    },
  },
};
