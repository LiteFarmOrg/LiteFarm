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

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PureWeatherForecast from '../../components/WeatherForecast';
import { useGetWeatherForecastQuery } from '../../store/api/weatherApi';
import { measurementSelector } from '../userFarmSlice';
import {
  formatDayPillLabel,
  groupSlotsByLocalDay,
  localTimeOfDay,
  localYmdFromUtcMs,
} from './utils';
import type { System } from '../../types';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

export default function WeatherForecast() {
  const language = getLanguageFromLocalStorage() || 'en';
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const system = useSelector(measurementSelector) as System;
  const { data, isLoading } = useGetWeatherForecastQuery();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const offsetSeconds = data?.city.timezoneOffsetSeconds ?? 0;

  const days = useMemo(() => (data ? groupSlotsByLocalDay(data) : []), [data]);
  const visibleDays = isCompact ? days.slice(0, 5) : days;
  const lastSlotIndex = visibleDays.length
    ? visibleDays[visibleDays.length - 1].slotIndices.slice(-1)[0]
    : 0;

  useEffect(() => {
    if (lastSlotIndex < selectedSlotIndex) {
      setSelectedSlotIndex(lastSlotIndex);
    }
  }, [lastSlotIndex, selectedSlotIndex]);

  const dayPillLabels = useMemo(() => {
    if (!visibleDays.length) {
      return [];
    }
    const todayLocalYmd = localYmdFromUtcMs(Date.now(), offsetSeconds);
    const browserTimezoneOffsetSeconds = -new Date().getTimezoneOffset() * 60;
    const offsetMatch = offsetSeconds === browserTimezoneOffsetSeconds;
    return visibleDays.map((d) => formatDayPillLabel(d, todayLocalYmd, offsetMatch, language));
  }, [visibleDays, offsetSeconds, language]);

  const selectedDayIndex = useMemo(() => {
    const index = visibleDays.findIndex((d) => d.slotIndices.includes(selectedSlotIndex));
    return index === -1 ? 0 : index;
  }, [visibleDays, selectedSlotIndex]);

  const selectedSlot = data?.slots[selectedSlotIndex];

  const activeSlotIndices = visibleDays[selectedDayIndex]?.slotIndices ?? [];
  const visibleSlots =
    data?.slots && activeSlotIndices.length
      ? data.slots.slice(activeSlotIndices[0], activeSlotIndices[activeSlotIndices.length - 1] + 1)
      : [];
  const relativeSelectedSlotIndex = activeSlotIndices.length
    ? activeSlotIndices.findIndex((index) => selectedSlotIndex === index)
    : 0;

  const handleSelectSlot = (slotIndex: number) =>
    setSelectedSlotIndex(activeSlotIndices[slotIndex]);

  const onDayClick = (dayIndex: number) => {
    const target = visibleDays[dayIndex];
    const currentTime = selectedSlot ? localTimeOfDay(selectedSlot.dt, offsetSeconds) : undefined;
    const match =
      currentTime !== undefined
        ? target.slotIndices.find(
            (i) => localTimeOfDay(data!.slots[i].dt, offsetSeconds) === currentTime,
          )
        : undefined;
    setSelectedSlotIndex(match ?? target.slotIndices[0]);
  };

  return (
    <PureWeatherForecast
      isLoading={isLoading}
      days={visibleDays}
      dayPillLabels={dayPillLabels}
      selectedDayIndex={selectedDayIndex}
      selectedSlot={selectedSlot}
      selectedSlotIndex={relativeSelectedSlotIndex}
      slots={visibleSlots}
      offsetSeconds={offsetSeconds}
      system={system}
      locale={language}
      onDayClick={onDayClick}
      onSelectSlot={handleSelectSlot}
      onPrev={selectedSlotIndex === 0 ? undefined : () => setSelectedSlotIndex((i) => i - 1)}
      onNext={
        selectedSlotIndex === lastSlotIndex ? undefined : () => setSelectedSlotIndex((i) => i + 1)
      }
    />
  );
}
