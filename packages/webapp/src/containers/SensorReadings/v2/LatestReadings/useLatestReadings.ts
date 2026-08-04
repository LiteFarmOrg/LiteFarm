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

import { useEffect, useState } from 'react';
import { useLazyGetSensorReadingsQuery } from '../../../../store/api/apiSlice';
import { Sensor, SensorReadings } from '../../../../store/api/types';

// Get the latest reading time across different reading types
const getLatestReadingTime = (sensorReadings: SensorReadings[]): Date | undefined => {
  if (!sensorReadings?.length) {
    return undefined;
  }

  const latestReadingTime = sensorReadings.reduce((latest, { readings }) => {
    return Math.max(latest, (readings.length && readings[readings.length - 1].dateTime) || 0);
  }, 0);

  return latestReadingTime > 0 ? new Date(latestReadingTime * 1000) : undefined;
};

const getTimestampMinutesAgo = (minutes: number) => Date.now() - minutes * 60 * 1000;

const RECENT_WINDOW_MINUTES = 15;
const EXTENDED_WINDOW_MINUTES = 2 * 60;
const LAST_SEEN_WINDOW_MINUTES = 60; // buffer on each side of the last_seen anchor

// The most recent last_seen across the given sensors, used to locate the last
// available reading for sensors that have stopped reporting.
const getMostRecentLastSeen = (sensors: Sensor[]): Date | undefined => {
  const timestamps = sensors
    .map(({ last_seen }) => (last_seen ? new Date(last_seen).getTime() : 0))
    .filter((time) => time > 0);

  return timestamps.length ? new Date(Math.max(...timestamps)) : undefined;
};

/**
 * Returns the latest available readings for the given sensors.
 *
 * Tries recent windows first (15 minutes, then 2 hours). If both are empty, falls
 * back to a window around the sensors' most recent `last_seen`, so a sensor that
 * has stopped reporting still shows its last values. Returns an empty array only
 * when no reading can be found at all.
 */
function useLatestReading(sensors: Sensor[]): {
  isLoading: boolean;
  isFetching: boolean;
  latestReadings: SensorReadings[];
  latestReadingTime?: Date;
  update: () => Promise<void>;
} {
  const [latestReadings, setLatestReadings] = useState<SensorReadings[]>([]);

  const [triggerGetSensorReadings, { isLoading, isFetching }] = useLazyGetSensorReadingsQuery();

  const latestReadingTime = getLatestReadingTime(latestReadings);

  const fetchReadings = (startTime: Date, endTime?: Date) => {
    // The "minute" and "second" truncation periods do not guarantee data for
    // every interval, so "minute" is used to maximise the chance of a value.
    return triggerGetSensorReadings({
      esids: sensors.map(({ external_id }) => external_id).join(','),
      startTime: startTime.toISOString(),
      endTime: endTime?.toISOString(),
      truncPeriod: 'minute',
    });
  };

  const loadLatestReadings = async (): Promise<void> => {
    // Try recent windows first, which is all a currently reporting sensor needs.
    for (const minutesAgo of [RECENT_WINDOW_MINUTES, EXTENDED_WINDOW_MINUTES]) {
      const result = await fetchReadings(new Date(getTimestampMinutesAgo(minutesAgo)));
      if (result.data?.length) {
        setLatestReadings(result.data);
        return;
      }
    }

    // Fall back to a window around the most recent reading on record, however
    // old, so an offline sensor still shows its last values instead of nothing.
    const lastSeen = getMostRecentLastSeen(sensors);
    if (lastSeen) {
      const buffer = LAST_SEEN_WINDOW_MINUTES * 60 * 1000;
      const result = await fetchReadings(
        new Date(lastSeen.getTime() - buffer),
        new Date(lastSeen.getTime() + buffer),
      );
      if (result.data?.length) {
        setLatestReadings(result.data);
        return;
      }
    }

    setLatestReadings([]);
  };

  useEffect(() => {
    loadLatestReadings();
  }, []);

  return {
    isLoading,
    isFetching,
    latestReadings,
    latestReadingTime,
    update: loadLatestReadings,
  };
}

export default useLatestReading;
