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

import { convert } from '../../util/convert-units/convert';
import type { WeatherForecast, WeatherForecastSlot } from '../../store/api/types';

export type Measurement = 'metric' | 'imperial';

export type ForecastDay = {
  localYmd: string;
  slotIndices: number[];
  isFrost: boolean;
  dayLowC: number;
  summaryIconCode: string;
};

export function localYmdFromUtcMs(utcMs: number, offsetSeconds: number): string {
  return new Date(utcMs + offsetSeconds * 1000).toISOString().slice(0, 10);
}

export function localHourOfSlot(slot: WeatherForecastSlot, offsetSeconds: number): number {
  const localMs = (slot.dt + offsetSeconds) * 1000;
  const d = new Date(localMs);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
}

function pickSummaryIconCode(
  slots: WeatherForecastSlot[],
  slotIndices: number[],
  offsetSeconds: number,
): string {
  let bestIndex = slotIndices[0];
  let bestDist = Infinity;
  for (const i of slotIndices) {
    const dist = Math.abs(localHourOfSlot(slots[i], offsetSeconds) - 12);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return slots[bestIndex].iconCode;
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
    const dayLowC = Math.min(...slotIndices.map((i) => slots[i].tempMinC));
    days.push({
      localYmd,
      slotIndices,
      isFrost: dayLowC < 2,
      dayLowC,
      summaryIconCode: pickSummaryIconCode(slots, slotIndices, offsetSeconds),
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
  locale: string,
  todayLabel: string,
): string {
  if (day.localYmd === todayLocalYmd) {
    return todayLabel;
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

export function formatTimeChipLabel(
  slot: WeatherForecastSlot,
  offsetSeconds: number,
  locale: string,
): string {
  const localMs = (slot.dt + offsetSeconds) * 1000;
  const date = new Date(localMs);
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
  let label = formatter.format(date);
  if (date.getUTCMinutes() === 0) {
    label = label.replace(/:00/, '');
  }
  return label
    .replace(/\s*AM$/i, 'am')
    .replace(/\s*PM$/i, 'pm')
    .trim();
}
export function convertTempForDisplay(tempC: number, measurement: Measurement): string {
  const value = Math.round(measurement === 'metric' ? tempC : convert(tempC).from('C').to('F'));
  const unit = measurement === 'metric' ? '°C' : '°F';
  return `${value}${unit}`;
}

export function convertWindForDisplay(windMs: number, measurement: Measurement): string {
  const unit = measurement === 'metric' ? 'km/h' : 'mph';
  const value = Math.round(convert(windMs).from('m/s').to(unit));
  return `${value} ${unit}`;
}

export function convertPrecipitationForDisplay(rainMm: number, measurement: Measurement): string {
  const unit = measurement === 'imperial' ? 'in' : 'mm';
  const value = Math.round(convert(rainMm).from('mm').to(unit));
  return `${value} ${unit}`;
}

export function frostThresholdLabel(measurement: Measurement): string {
  return measurement === 'imperial' ? '< 36°F' : '< 2°C';
}
