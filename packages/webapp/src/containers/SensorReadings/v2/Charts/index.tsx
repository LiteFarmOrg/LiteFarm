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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import LineChart, { LineConfig } from '../../../../components/Charts/LineChart';
import Spinner, { OverlaySpinner } from '../../../../components/Spinner';
import useFormattedSensorReadings from './useFormattedSensorReadings';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import { getTruncPeriod } from '../utils';
import { Sensor, SensorTypes } from '../../../../store/api/types';
import {
  SENSOR_ARRAY_CHART_PARAMS,
  SENSOR_CHART_PARAMS,
  WEATHER_STATION_CHART_PARAMS,
  STANDALONE_SENSOR_COLORS_MAP,
} from '../constants';
import styles from '../styles.module.scss';

interface SensorChartsProps {
  sensors: Sensor[];
  startDate: string;
  endDate: string;
}

type SensorArrayChartsProps = SensorChartsProps & {
  sensorColorMap: LineConfig[];
};

const getSupportedReadingTypes = (isSensorArray: boolean, sensorName: SensorTypes) => {
  if (isSensorArray) {
    return SENSOR_ARRAY_CHART_PARAMS;
  }
  return sensorName === 'Weather station' ? WEATHER_STATION_CHART_PARAMS : SENSOR_CHART_PARAMS;
};

const Charts = (props: SensorChartsProps | SensorArrayChartsProps) => {
  const { sensors, startDate, endDate } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

  const isSensorArray = 'sensorColorMap' in props;
  const truncPeriod = getTruncPeriod(new Date(startDate), new Date(endDate))!;
  const supportedReadingTypes = getSupportedReadingTypes(isSensorArray, sensors[0].name);

  const { isLoading, isFetching, formattedSensorReadings, ticks } = useFormattedSensorReadings({
    sensors,
    startDate,
    endDate,
    truncPeriod,
    readingTypes: supportedReadingTypes,
  });

  if (isLoading) {
    return (
      <div className={styles.spinnerWrapper}>
        <Spinner />
      </div>
    );
  }

  if (!formattedSensorReadings?.length) {
    return (
      <div className={styles.noDataRect}>
        {isFetching && <OverlaySpinner />}
        {t('SENSOR.NO_DATA_FOUND')}
      </div>
    );
  }

  return (
    <div className={clsx(styles.charts, isSensorArray ? '' : styles.sensor)}>
      {isFetching && <OverlaySpinner />}
      {formattedSensorReadings.map(({ reading_type, unit, readings }) => {
        const paramColor = STANDALONE_SENSOR_COLORS_MAP[reading_type];
        const lineConfig = isSensorArray
          ? props.sensorColorMap
          : [{ id: sensors[0].external_id, color: paramColor }];
        const colors = isSensorArray ? {} : { title: paramColor, yAxisTick: paramColor };

        return (
          <LineChart
            key={reading_type}
            title={`${t(`SENSOR.READING.${reading_type.toUpperCase()}`)} (${unit})`}
            language={language || 'en'}
            lineConfig={lineConfig}
            data={readings}
            ticks={ticks}
            truncPeriod={truncPeriod}
            formatTooltipValue={(_label, value) => {
              return typeof value === 'number' ? `${value}${unit}` : '';
            }}
            isCompactView={isCompactView}
            colors={colors}
          />
        );
      })}
    </div>
  );
};

export default Charts;
