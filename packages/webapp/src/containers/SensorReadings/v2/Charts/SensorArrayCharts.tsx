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
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import CustomLineChart, { LineConfig } from '../../../../components/Charts/LineChart';
import { measurementSelector } from '../../../userFarmSlice';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import {
  convertEsciReadingValue,
  formatSensorsData,
  getReadingUnit,
  getTruncPeriod,
} from '../utils';
import { getTicks } from '../../../../components/Charts/utils';
import { useGetSensorReadingsQuery } from '../../../../store/api/apiSlice';
import { Sensor } from '../../../../store/api/types';
import { SENSOR_PARAMS } from '../constants';
import styles from '../styles.module.scss';

const SENSORS = ['LSZDWX', 'WV2JHV', '8YH5Y5', 'BWKBAL'];

interface ChartsProps {
  sensors: Sensor[];
  startDate?: string;
  endDate?: string;
  startDateString?: string;
  endDateString?: string;
  sensorColorMap: LineConfig[];
}

function Charts({
  sensors,
  startDate,
  endDate,
  startDateString,
  endDateString,
  sensorColorMap,
}: ChartsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();
  const system = useSelector(measurementSelector);

  const truncPeriod = getTruncPeriod(startDateString, endDateString)!;

  const sensorIds = sensors.map(({ external_id }) => external_id);

  const { data: sensorReadings } = useGetSensorReadingsQuery(
    {
      esids: sensorIds.join(','),
      startTime: startDate,
      endTime: endDate,
      // validated: true,
      truncPeriod,
    },
    { refetchOnMountOrArgChange: true },
  );

  const formattedData = useMemo(() => {
    if (!sensorReadings?.length) {
      return [];
    }

    return sensorReadings.map(({ reading_type, readings, unit }) => {
      const valueConverter = (value: number) =>
        convertEsciReadingValue(value, reading_type, system);
      const timezoneOffset = new Date(startDate!).getTimezoneOffset();

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

  if (sensorReadings === undefined) {
    return <div>Loading...</div>;
  }

  if (!formattedData.length) {
    return <div>No data</div>;
  }

  return (
    <div className={styles.charts}>
      {SENSOR_PARAMS[sensors[0].name]?.flatMap((param) => {
        const data = formattedData.find((data) => data.reading_type === param);
        if (!data) {
          return [];
        }

        const { reading_type, unit, readings } = data;
        const ticks =
          startDateString && endDateString
            ? getTicks(startDateString, endDateString, {
                skipEmptyEndTicks: true,
                lastDataPointDateTime: readings[readings.length - 1].dateTime,
              })
            : undefined;

        return (
          <CustomLineChart
            key={reading_type}
            title={`${t(`SENSOR.READING.${reading_type.toUpperCase()}`)} (${unit})`}
            language={language || 'en'}
            lineConfig={sensorColorMap}
            data={readings}
            ticks={ticks}
            truncPeriod={truncPeriod}
            formatTooltipValue={(_label, value) => {
              return typeof value === 'number' ? `${value.toFixed(2)}${unit}` : '';
            }}
            isCompactView={isCompactView}
          />
        );
      })}
    </div>
  );
}

export default Charts;
