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
import { useMemo, useState } from 'react';
import PureWeatherForecast from '../../components/WeatherForecast';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import {
  formatDayPillLabel,
  groupSlotsByLocalDay,
  localTimeOfDay,
  localYmdFromUtcMs,
} from '../../containers/WeatherForecast/utils';
import { buildMockForecast } from './mockData';
import type { System } from '../../types';

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
  system = 'metric',
  isLoading = false,
}: {
  frostDayIndex?: number;
  initialSlotIndex: number;
  system?: System;
  isLoading?: boolean;
}) => {
  const forecast = useMemo(() => buildMockForecast({ frostDayIndex }), [frostDayIndex]);
  const days = useMemo(() => groupSlotsByLocalDay(forecast), [forecast]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(initialSlotIndex);
  const todayYmd = localYmdFromUtcMs(
    forecast.slots[0].dt * 1000,
    forecast.city.timezoneOffsetSeconds,
  );
  const offsetMatch = true; // show "Today" label (assumes browser timezone matches farm)
  const labels = days.map((d) => formatDayPillLabel(d, todayYmd, offsetMatch, 'en-US'));
  const selectedDayIndex = days.findIndex((d) => d.slotIndices.includes(selectedSlotIndex));
  const selectedSlot = forecast.slots[selectedSlotIndex];

  const activeSlotIndices = days[selectedDayIndex].slotIndices;
  const visibleSlots = forecast.slots.slice(
    activeSlotIndices[0],
    activeSlotIndices[activeSlotIndices.length - 1] + 1,
  );
  const relativeSelectedSlotIndex = activeSlotIndices.findIndex(
    (index) => selectedSlotIndex === index,
  );

  const handleSelectSlot = (slotIndex: number) =>
    setSelectedSlotIndex(activeSlotIndices[slotIndex]);

  const onDayClick = (dayIndex: number) => {
    const currentHour = localTimeOfDay(selectedSlot.dt, forecast.city.timezoneOffsetSeconds);
    const target = days[dayIndex];
    const match = target.slotIndices.find(
      (i) =>
        localTimeOfDay(forecast.slots[i].dt, forecast.city.timezoneOffsetSeconds) === currentHour,
    );
    setSelectedSlotIndex(match ?? target.slotIndices[0]);
  };

  return (
    <PureWeatherForecast
      isLoading={isLoading}
      days={days}
      dayPillLabels={labels}
      selectedDayIndex={selectedDayIndex}
      selectedSlot={selectedSlot}
      selectedSlotIndex={relativeSelectedSlotIndex}
      slots={visibleSlots}
      offsetSeconds={forecast.city.timezoneOffsetSeconds}
      system={system}
      locale="en-US"
      onDayClick={onDayClick}
      onSelectSlot={handleSelectSlot}
      onPrev={
        selectedSlotIndex === 0 ? undefined : () => setSelectedSlotIndex((i) => Math.max(0, i - 1))
      }
      onNext={
        selectedSlotIndex === forecast.slots.length - 1
          ? undefined
          : () => setSelectedSlotIndex((i) => Math.min(forecast.slots.length - 1, i + 1))
      }
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
  render: () => <Wrapper initialSlotIndex={0} system="imperial" />,
};

export const Loading: Story = {
  render: () => <Wrapper initialSlotIndex={0} isLoading={true} />,
};
