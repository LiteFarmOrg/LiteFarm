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
import CustomLineChart from '../../../../components/Charts/LineChart';
import { colors } from '../../../../assets/theme';
import { measurementSelector } from '../../../userFarmSlice';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import {
  adjustDailyDateTime,
  convertEsciReadingValue,
  formatSensorsData,
  getTruncPeriod,
} from '../utils';
import { getTicks } from '../../../../components/Charts/utils';
import { useGetSensorReadingsQuery } from '../../../../store/api/apiSlice';
import { Sensor } from '../../../../store/api/types';
import { SENSOR_PARAMS } from '../constants';
import styles from '../styles.module.scss';

const SENSORS = ['LSZDWX', 'WV2JHV', '8YH5Y5', 'BWKBAL'];

const LINE_COLORS = [
  colors.chartBlue,
  colors.chartYellow,
  colors.chartGreen,
  colors.chartRed,
  colors.chartPurple,
  colors.chartBrown,
];

interface ChartsProps {
  sensors: Sensor[];
  startDate?: string;
  endDate?: string;
  startDateString?: string;
  endDateString?: string;
}

function Charts({ sensors, startDate, endDate, startDateString, endDateString }: ChartsProps) {
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

    return sensorReadings.map((data) => {
      let adjustDateTime: ((dateTime: number) => number) | undefined = undefined;

      if (truncPeriod === 'hour') {
        const startTimeTimezoneOffset = new Date(startDate!).getTimezoneOffset();
        const hourlyTimeOffset = startTimeTimezoneOffset % 60;

        // Handle time offset when the difference is not full hour
        if (hourlyTimeOffset) {
          const isAheadUTC = startTimeTimezoneOffset < 0;
          adjustDateTime = (dateTime: number) =>
            dateTime + hourlyTimeOffset * (isAheadUTC ? 1 : -1) * 60;
        }
      } else {
        adjustDateTime = adjustDailyDateTime;
      }

      const valueConverter = (value: number) =>
        convertEsciReadingValue(value, data.reading_type, system);
      return {
        ...data,
        readings: formatSensorsData(
          data.readings,
          truncPeriod,
          sensorIds,
          valueConverter,
          adjustDateTime,
        ),
      };
    });
  }, [sensorReadings]);

  if (sensorReadings === undefined) {
    return <div>Loading...</div>;
  }

  if (!formattedData.length) {
    return <div>No data</div>;
  }

  const lineConfig = sensors.map(({ external_id }, index) => ({
    id: external_id,
    color: LINE_COLORS[index],
  }));

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
            lineConfig={lineConfig}
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
