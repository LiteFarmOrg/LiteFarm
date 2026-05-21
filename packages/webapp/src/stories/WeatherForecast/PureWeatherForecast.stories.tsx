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

import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import PureWeatherForecast from '../../components/WeatherForecast';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import {
  formatDayPillLabel,
  groupSlotsByLocalDay,
  localHourOfSlot,
  localYmdFromUtcMs,
  type Measurement,
} from '../../containers/WeatherForecast/selectors';
import { buildMockForecast } from './mockData';

const meta: Meta<typeof PureWeatherForecast> = {
  title: 'Components/WeatherForecast/PureWeatherForecast',
  component: PureWeatherForecast,
  decorators: componentDecoratorsWithoutPadding,
};
export default meta;

type Story = StoryObj<typeof PureWeatherForecast>;

const Wrapper = ({
  frostDayIndex,
  initialSlotIndex,
  measurement = 'metric',
}: {
  frostDayIndex?: number;
  initialSlotIndex: number;
  measurement?: Measurement;
}) => {
  const forecast = useMemo(() => buildMockForecast({ frostDayIndex }), [frostDayIndex]);
  const days = useMemo(() => groupSlotsByLocalDay(forecast), [forecast]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(initialSlotIndex);
  const todayYmd = localYmdFromUtcMs(
    forecast.slots[0].dt * 1000,
    forecast.city.timezoneOffsetSeconds,
  );
  const labels = days.map((d) => formatDayPillLabel(d, todayYmd, 'en-US', 'Today'));
  const selectedDayIndex = days.findIndex((d) => d.slotIndices.includes(selectedSlotIndex));
  const selectedSlot = forecast.slots[selectedSlotIndex];

  const onDayClick = (dayIndex: number) => {
    const currentHour = localHourOfSlot(selectedSlot, forecast.city.timezoneOffsetSeconds);
    const target = days[dayIndex];
    const match = target.slotIndices.find(
      (i) =>
        localHourOfSlot(forecast.slots[i], forecast.city.timezoneOffsetSeconds) === currentHour,
    );
    setSelectedSlotIndex(match ?? target.slotIndices[0]);
  };

  return (
    <PureWeatherForecast
      days={days}
      dayPillLabels={labels}
      selectedDayIndex={selectedDayIndex}
      selectedSlot={selectedSlot}
      selectedSlotIndex={selectedSlotIndex}
      slots={forecast.slots}
      offsetSeconds={forecast.city.timezoneOffsetSeconds}
      measurement={measurement}
      locale="en-US"
      onDayClick={onDayClick}
      onSelectSlot={setSelectedSlotIndex}
      onPrev={() => setSelectedSlotIndex((i) => Math.max(0, i - 1))}
      onNext={() => setSelectedSlotIndex((i) => Math.min(forecast.slots.length - 1, i + 1))}
    />
  );
};

export const Default: Story = { render: () => <Wrapper initialSlotIndex={0} /> };

export const FutureDaySelected: Story = {
  render: () => <Wrapper initialSlotIndex={24} />,
};

export const FrostDaySelected: Story = {
  render: () => <Wrapper frostDayIndex={3} initialSlotIndex={24} />,
};

export const Imperial: Story = {
  render: () => <Wrapper initialSlotIndex={0} measurement="imperial" />,
};
