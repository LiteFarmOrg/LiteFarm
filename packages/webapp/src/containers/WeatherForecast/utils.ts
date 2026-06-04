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

import { convert } from '../../util/convert-units/convert';
import i18n from '../../locales/i18n';
import type { WeatherForecast, WeatherForecastSlot } from '../../store/api/types';
import type { System } from '../../types';

export type ForecastDay = {
  localYmd: string;
  slotIndices: number[];
  isFrost: boolean;
};

export function localYmdFromUtcMs(utcMs: number, offsetSeconds: number): string {
  return new Date(utcMs + offsetSeconds * 1000).toISOString().slice(0, 10);
}

export function localTimeOfDay(utcSeconds: number, offsetSeconds: number): number {
  const localMs = (utcSeconds + offsetSeconds) * 1000;
  const d = new Date(localMs);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
}

export function groupSlotsByLocalDay(forecast: WeatherForecast): ForecastDay[] {
  const { slots } = forecast;
  const offsetSeconds = forecast.city.timezoneOffsetSeconds;

  const byYmd = new Map<string, number[]>();
  slots.forEach((slot, index) => {
    const ymd = localYmdFromUtcMs(slot.dt * 1000, offsetSeconds);
    const bucket = byYmd.get(ymd);
    if (bucket) {
      bucket.push(index);
    } else {
      byYmd.set(ymd, [index]);
    }
  });

  const days: ForecastDay[] = [];
  for (const [localYmd, slotIndices] of byYmd) {
    const dayLowC = Math.min(...slotIndices.map((i) => slots[i].tempC));
    days.push({
      localYmd,
      slotIndices,
      isFrost: dayLowC < 2,
    });
  }
  return days;
}

function parseLocalYmdAsUtcNoon(localYmd: string): Date {
  const [y, m, d] = localYmd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function formatDayPillLabel(
  day: ForecastDay,
  todayLocalYmd: string,
  offsetMatch: boolean,
  locale: string,
): string {
  if (offsetMatch && day.localYmd === todayLocalYmd) {
    return i18n.t('common:TODAY');
  }
  const date = parseLocalYmdAsUtcNoon(day.localYmd);
  return date.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });
}

export function formatLongDate(day: ForecastDay, locale: string): string {
  const date = parseLocalYmdAsUtcNoon(day.localYmd);
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function convertTempForDisplay(tempC: number, system: System): string {
  const value = Math.round(system === 'metric' ? tempC : convert(tempC).from('C').to('F'));
  const unit = system === 'metric' ? '°C' : '°F';
  return `${value}${unit}`;
}

export function convertWindForDisplay(windMs: number, system: System): string {
  const unit = system === 'metric' ? 'km/h' : 'mph';
  const value = Math.round(convert(windMs).from('m/s').to(unit));
  return `${value} ${unit}`;
}

export function convertPrecipitationForDisplay(
  rainMm: number,
  snowMm: number,
  system: System,
): string {
  const unit = system === 'metric' ? 'mm' : 'in';
  const value = convert(rainMm + snowMm)
    .from('mm')
    .to(unit);
  const displayValue = system === 'metric' ? value : Math.round(value * 1000) / 1000;
  return `${displayValue} ${unit}`;
}
