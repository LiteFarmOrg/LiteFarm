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

export function getTimeDifferrenceInSeconds(pastDate: Date, futureDate: Date) {
  return (futureDate.getTime() - pastDate.getTime()) / 1000;
}

export function getDurationString(timeInSeconds: number) {
  if (timeInSeconds < 60) {
    return '<1m';
  }

  const timeInMinutes = Math.round(timeInSeconds / 60);
  const hours = Math.round(timeInMinutes / 60);
  const minutes = Math.round(timeInMinutes - hours * 60);
  const durationString = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
  return durationString;
}

export function isSameDay(date1: Date, date2: Date) {
  if (!date1 || !date2) {
    return false;
  }
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth()
  );
}

// For use with sensor data to determine if sensor is online or offline
export function isLessThanTwelveHrsAgo(datetime: Date): boolean {
  const TwelveHrsInMs = 12 * 60 * 60 * 1000;
  return Date.now() - new Date(datetime).getTime() < TwelveHrsInMs;
}
