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
  type Measurement,
} from './selectors';

export default function WeatherForecast() {
  const { t, i18n } = useTranslation();
  const measurement = useSelector(measurementSelector) as Measurement;
  const { data, isLoading } = useGetWeatherForecastQuery();
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const offsetSeconds = data?.city.timezoneOffsetSeconds ?? 0;

  const days = useMemo(() => (data ? groupSlotsByLocalDay(data) : []), [data]);

  const todayLocalYmd = useMemo(
    () => localYmdFromUtcMs(Date.now(), offsetSeconds),
    [offsetSeconds],
  );

  const dayPillLabels = useMemo(
    () => days.map((d) => formatDayPillLabel(d, todayLocalYmd, i18n.language, t('WEATHER.TODAY'))),
    [days, todayLocalYmd, i18n.language, t],
  );

  const selectedDayIndex = useMemo(
    () => days.findIndex((d) => d.slotIndices.includes(selectedSlotIndex)),
    [days, selectedSlotIndex],
  );

  if (isLoading || !data || data.slots.length === 0) {
    return null;
  }

  const selectedSlot = data.slots[selectedSlotIndex];

  const onDayClick = (dayIndex: number) => {
    const currentHour = localHourOfSlot(selectedSlot, offsetSeconds);
    const target = days[dayIndex];
    const match = target.slotIndices.find(
      (i) => localHourOfSlot(data.slots[i], offsetSeconds) === currentHour,
    );
    setSelectedSlotIndex(match ?? target.slotIndices[0]);
  };

  return (
    <PureWeatherForecast
      days={days}
      dayPillLabels={dayPillLabels}
      selectedDayIndex={selectedDayIndex}
      selectedSlot={selectedSlot}
      selectedSlotIndex={selectedSlotIndex}
      slots={data.slots}
      offsetSeconds={offsetSeconds}
      measurement={measurement}
      locale={i18n.language}
      onDayClick={onDayClick}
      onSelectSlot={setSelectedSlotIndex}
      onPrev={() => setSelectedSlotIndex((i) => Math.max(0, i - 1))}
      onNext={() => setSelectedSlotIndex((i) => Math.min(data.slots.length - 1, i + 1))}
    />
  );
}
