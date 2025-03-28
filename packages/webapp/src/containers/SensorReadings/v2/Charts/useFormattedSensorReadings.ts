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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChartTruncPeriod } from '../../../../components/Charts/LineChart';
import { measurementSelector } from '../../../userFarmSlice';
import {
  convertEsciReadingValue,
  formatSensorsData,
  FormattedSensorDatapoint,
  getReadingUnit,
} from '../utils';
import { getTicks } from '../../../../components/Charts/utils';
import { useGetSensorReadingsQuery } from '../../../../store/api/apiSlice';
import { Sensor, SensorReadingTypes } from '../../../../store/api/types';

const SENSORS = ['LSZDWX', 'WV2JHV', '8YH5Y5', 'BWKBAL'];

interface useFormattedSensorReadingsProps {
  sensors: Sensor[];
  startDate: string;
  endDate: string;
  truncPeriod: ChartTruncPeriod;
}

function useFormattedSensorReadings({
  sensors,
  startDate,
  endDate,
  truncPeriod,
}: useFormattedSensorReadingsProps): {
  isLoading: boolean;
  ticks: number[];
  formattedSensorReadings: {
    reading_type: SensorReadingTypes;
    readings: FormattedSensorDatapoint[];
    unit: string;
  }[];
} {
  const system = useSelector(measurementSelector);
  const sensorIds = sensors.map(({ external_id }) => external_id);

  const { isLoading, data: sensorReadings } = useGetSensorReadingsQuery(
    {
      esids: sensorIds.join(','),
      startTime: startDate,
      endTime: endDate,
      truncPeriod,
    },
    { refetchOnMountOrArgChange: true },
  );

  const lastDayInChart = sensorReadings?.reduce((lastDay, { readings }) => {
    return Math.max(lastDay, readings[readings.length - 1].dateTime);
  }, 0);

  const ticks = lastDayInChart
    ? getTicks(new Date(startDate), new Date(endDate), {
        skipEmptyEndTicks: true,
        lastDataPointDateTime: lastDayInChart,
      })
    : getTicks(new Date(startDate), new Date(endDate));

  const formattedSensorReadings = useMemo(() => {
    if (!sensorReadings?.length) {
      return [];
    }

    const timezoneOffset = new Date(startDate).getTimezoneOffset();

    return sensorReadings.map(({ reading_type, readings, unit }) => {
      const valueConverter = (value: number) =>
        convertEsciReadingValue(value, reading_type, system);

      return {
        reading_type,
        readings: formatSensorsData(
          readings,
          truncPeriod,
          sensorIds,
          valueConverter,
          timezoneOffset,
        ),
        unit: getReadingUnit(reading_type, system, unit),
      };
    });
  }, [sensorReadings]);

  return { isLoading, ticks, formattedSensorReadings };
}

export default useFormattedSensorReadings;
