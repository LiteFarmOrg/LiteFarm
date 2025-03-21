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
    return Math.max(latest, readings[readings.length - 1].dateTime);
  }, 0);

  return new Date(latestReadingTime * 1000);
};

function useLatestReading(sensors: Sensor[]): {
  isLoading: boolean;
  latestReadings: SensorReadings[];
  latestReadingTime?: Date;
  update: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [latestReadings, setLatestReadings] = useState<SensorReadings[]>([]);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [triggerGetSensorReadings] = useLazyGetSensorReadingsQuery();

  const getLatestReadings = async (startTime?: Date) => {
    setIsLoading(true);

    let adjustedStartTime = startTime;

    if (!adjustedStartTime) {
      adjustedStartTime = new Date();
      adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() - 10);
    }

    // As of Mar 21, 2025, the latest available data appears to be from 3 minutes ago.
    // truncPeriod: 'minute' / 'second' does not provide data for every minute or second.
    // Use 'minute' here to ensure we get data.
    const result = await triggerGetSensorReadings({
      esids: sensors.map(({ external_id }) => external_id).join(','),
      startTime: adjustedStartTime.toISOString(),
      truncPeriod: 'minute',
    });

    setIsLoading(false);

    return result;
  };

  const setInitialLatestReadings = async () => {
    const result = await getLatestReadings();

    if (result.data?.length) {
      setLatestReadings(result.data);
      return;
    }

    const latestSeenInMilliSeconds = sensors.reduce((latest, { last_seen }) => {
      return Math.max(latest, new Date(last_seen).getTime());
    }, 0);

    refetchSensorReadings(new Date(latestSeenInMilliSeconds));
  };

  const refetchSensorReadings = async (startTime?: Date): Promise<void> => {
    const result = await getLatestReadings(startTime);
    if (result.data) {
      setLatestReadings(result.data);
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
    latestReadings,
    latestReadingTime: getLatestReadingTime(latestReadings),
    update: refetchSensorReadings,
  };
}

export default useLatestReading;
