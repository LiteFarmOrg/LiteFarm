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
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enqueueErrorSnackbar } from '../../../Snackbar/snackbarSlice';
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

const getTwoHoursAgoInMilliSeconds = () => {
  const date = new Date();
  date.setHours(date.getHours() - 2);

  return date.getTime();
};

/**
 * Return the latest readings from the last 2 hours.
 * If no data exists, in the period, no readings will be returned.
 */
function useLatestReading(sensors: Sensor[]): {
  isLoading: boolean;
  isFetching: boolean;
  latestReadings: SensorReadings[];
  latestReadingTime?: Date;
  update: () => void;
} {
  const [latestReadings, setLatestReadings] = useState<SensorReadings[]>([]);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [triggerGetSensorReadings, { isLoading, isFetching }] = useLazyGetSensorReadingsQuery();

  const latestReadingTime = getLatestReadingTime(latestReadings);

  const getLatestReadings = async (startTime?: Date) => {
    let adjustedStartTime = startTime;

    if (!adjustedStartTime) {
      // Default to 15 minutes ago to ensure recent data is included in case "last_seen" is outdated
      adjustedStartTime = new Date();
      adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() - 15);
    }

    // As of Mar 21, 2025, the latest available data appears to be from 3 minutes ago.
    // truncPeriod: 'minute' / 'second' does not provide data for every minute or second.
    // Use 'minute' here to ensure we get data.
    const result = await triggerGetSensorReadings({
      esids: sensors.map(({ external_id }) => external_id).join(','),
      startTime: adjustedStartTime.toISOString(),
      truncPeriod: 'minute',
    });

    return result;
  };

  const setInitialLatestReadings = async () => {
    const result = await getLatestReadings();

    if (result.data?.length) {
      setLatestReadings(result.data);
      return;
    }

    const latestLastSeenInMilliSeconds = sensors.reduce((latest, { last_seen }) => {
      return Math.max(latest, new Date(last_seen).getTime());
    }, 0);

    const twoHoursAgoInMilliSeconds = getTwoHoursAgoInMilliSeconds();

    // If any sensor reported data in the last 2 hours, attempt to fetch its readings
    if (latestLastSeenInMilliSeconds > twoHoursAgoInMilliSeconds) {
      // Start 5 mins before the latest last_seen to avoid missing data near the edge
      const startTime = latestLastSeenInMilliSeconds - 5 * 60 * 1000;
      refetchSensorReadings(new Date(startTime));
    }
  };

  const refetchSensorReadings = async (startTime?: Date): Promise<void> => {
    const result = await getLatestReadings(startTime);
    // Retain current readings if no newer data is available
    if (result.data?.length) {
      setLatestReadings(result.data);
      return;
    }
    // If the current readings is older than 2 hours, clear it
    if (latestReadingTime && latestReadingTime.getTime() < getTwoHoursAgoInMilliSeconds()) {
      setLatestReadings([]);
      return;
    }

    if (result.error) {
      dispatch(enqueueErrorSnackbar(t('Failed to fetch latest sensor readings')));
    }
  };

  useEffect(() => {
    setInitialLatestReadings();
  }, []);

  return {
    isLoading,
    isFetching,
    latestReadings,
    latestReadingTime,
    update: () => refetchSensorReadings(),
  };
}

export default useLatestReading;
