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
import DayWeatherSummary from '../../components/WeatherForecast/DayWeatherSummary';
import { componentDecorators } from '../Pages/config/Decorators';
import { groupSlotsByLocalDay } from '../../containers/WeatherForecast/selectors';
import { buildMockForecast } from './mockData';

const forecast = buildMockForecast({ frostDayIndex: 2 });
const days = groupSlotsByLocalDay(forecast);

const meta: Meta<typeof DayWeatherSummary> = {
  title: 'Components/WeatherForecast/DayWeatherSummary',
  component: DayWeatherSummary,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof DayWeatherSummary>;

export const Default: Story = {
  args: {
    day: days[0],
    selectedSlot: forecast.slots[days[0].slotIndices[0]],
    system: 'metric',
    locale: 'en',
  },
};

export const WithFrostBanner: Story = {
  args: {
    day: days[2],
    selectedSlot: forecast.slots[days[2].slotIndices[0]],
    system: 'metric',
    locale: 'en',
  },
};

export const Imperial: Story = {
  args: {
    day: days[0],
    selectedSlot: forecast.slots[days[0].slotIndices[0]],
    system: 'imperial',
    locale: 'en',
  },
};
