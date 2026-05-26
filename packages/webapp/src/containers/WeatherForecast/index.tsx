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

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureWeatherForecast from '../../components/WeatherForecast';
import { useGetWeatherForecastQuery } from '../../store/api/weatherApi';
import { measurementSelector } from '../userFarmSlice';
import {
  formatDayPillLabel,
  groupSlotsByLocalDay,
  localHourOfSlot,
  localYmdFromUtcMs,
} from './selectors';
import type { System } from '../../types';

export default function WeatherForecast() {
  const { i18n } = useTranslation();
  const system = useSelector(measurementSelector) as System;
  const { data, isLoading } = useGetWeatherForecastQuery();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const offsetSeconds = data?.city.timezoneOffsetSeconds ?? 0;

  const days = useMemo(() => (data ? groupSlotsByLocalDay(data) : []), [data]);

  const dayPillLabels = useMemo(() => {
    const todayLocalYmd = localYmdFromUtcMs(Date.now(), offsetSeconds);
    const browserTimezoneOffsetSeconds = -new Date().getTimezoneOffset() * 60;
    const offsetMatch = offsetSeconds === browserTimezoneOffsetSeconds;
    return days.map((d) => formatDayPillLabel(d, todayLocalYmd, offsetMatch, i18n.language));
  }, [days, offsetSeconds, i18n.language]);

  const selectedDayIndex = useMemo(
    () => days.findIndex((d) => d.slotIndices.includes(selectedSlotIndex)),
    [days, selectedSlotIndex],
  );

  const selectedSlot = data?.slots[selectedSlotIndex];

  const onDayClick = (dayIndex: number) => {
    if (!selectedSlot) {
      return;
    }
    const currentHour = localHourOfSlot(selectedSlot, offsetSeconds);
    const target = days[dayIndex];
    const match = target.slotIndices.find(
      (i) => localHourOfSlot(data.slots[i], offsetSeconds) === currentHour,
    );
    setSelectedSlotIndex(match ?? target.slotIndices[0]);
  };

  const onNext = () => {
    if (!data?.slots?.length) {
      return;
    }
    setSelectedSlotIndex((i) => Math.min(data.slots.length - 1, i + 1));
  };

  return (
    <PureWeatherForecast
      isLoading={isLoading}
      days={days}
      dayPillLabels={dayPillLabels}
      selectedDayIndex={selectedDayIndex}
      selectedSlot={selectedSlot}
      selectedSlotIndex={selectedSlotIndex}
      slots={data?.slots}
      offsetSeconds={offsetSeconds}
      system={system}
      locale={i18n.language}
      onDayClick={onDayClick}
      onSelectSlot={setSelectedSlotIndex}
      onPrev={() => setSelectedSlotIndex((i) => Math.max(0, i - 1))}
      onNext={onNext}
    />
  );
}
