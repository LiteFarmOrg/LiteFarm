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

import type { WeatherForecast, WeatherForecastSlot } from '../../store/api/types';

const OFFSET_SECONDS_VANCOUVER = -7 * 3600;

function buildSlot(
  dtUtcSeconds: number,
  overrides: Partial<WeatherForecastSlot> = {},
): WeatherForecastSlot {
  return {
    dt: dtUtcSeconds,
    tempC: 12,
    iconCode: '02d',
    pop: 0.1,
    rainMm3h: 0,
    snowMm3h: 0,
    windMs: 3,
    humidity: 55,
    ...overrides,
  };
}

export function buildMockForecast({
  frostDayIndex,
}: { frostDayIndex?: number } = {}): WeatherForecast {
  const baseSeconds = Math.floor(new Date(Date.UTC(2026, 2, 9, 0, 0, 0)).getTime() / 1000);
  const slots: WeatherForecastSlot[] = [];
  for (let day = 0; day < 5; day += 1) {
    for (let step = 0; step < 8; step += 1) {
      const dt = baseSeconds + (day * 8 + step) * 3 * 3600;
      const isFrostDay = frostDayIndex === day;
      const baseTemp = isFrostDay ? -2 + step * 0.5 : 8 + step * 0.7;
      slots.push(
        buildSlot(dt, {
          tempC: baseTemp,
          iconCode: step >= 3 && step <= 5 ? '10d' : '02d',
          rainMm3h: step === 4 ? 1.4 : 0,
          snowMm3h: 0,
          windMs: 2 + (step % 3),
          humidity: 50 + (step % 4) * 5,
        }),
      );
    }
  }
  return {
    city: { name: 'Vancouver', timezoneOffsetSeconds: OFFSET_SECONDS_VANCOUVER },
    slots,
  };
}
