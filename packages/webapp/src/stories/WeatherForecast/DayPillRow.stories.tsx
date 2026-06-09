/*
 *  Copyright 2026 LiteFarm.org
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

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import DayPillRow from '../../components/WeatherForecast/DayPillRow';
import { componentDecorators } from '../Pages/config/Decorators';
import {
  formatDayPillLabel,
  groupSlotsByLocalDay,
  localYmdFromUtcMs,
} from '../../containers/WeatherForecast/utils';
import { buildMockForecast } from './mockData';

const forecast = buildMockForecast({ frostDayIndex: 2 });
const days = groupSlotsByLocalDay(forecast).slice(0, 5);
const todayYmd = localYmdFromUtcMs(
  forecast.slots[0].dt * 1000,
  forecast.city.timezoneOffsetSeconds,
);
const offsetMatch = true; // show "Today" label (assumes browser timezone matches farm)
const labels = days.map((d) => formatDayPillLabel(d, todayYmd, offsetMatch, 'en'));

const meta: Meta<typeof DayPillRow> = {
  title: 'Components/WeatherForecast/DayPillRow',
  component: DayPillRow,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof DayPillRow>;

const Wrapper = (args: { initialIndex: number }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(args.initialIndex);
  return (
    <DayPillRow
      days={days}
      labels={labels}
      selectedDayIndex={selectedDayIndex}
      onDayClick={setSelectedDayIndex}
    />
  );
};

export const Default: Story = {
  render: () => <Wrapper initialIndex={0} />,
};

export const FutureDaySelected: Story = {
  render: () => <Wrapper initialIndex={3} />,
};

export const FrostDaySelected: Story = {
  render: () => <Wrapper initialIndex={2} />,
};
