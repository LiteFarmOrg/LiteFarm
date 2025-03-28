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

import { useTranslation } from 'react-i18next';
import { useMediaQuery, useTheme } from '@mui/material';
import CustomLineChart from '../../../../components/Charts/LineChart';
import useFormattedSensorReadings from './useFormattedSensorReadings';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import { getTruncPeriod } from '../utils';
import { Sensor } from '../../../../store/api/types';
import { SENSOR_CHART_PARAMS, STANDALONE_SENSOR_COLORS_MAP } from '../constants';
import styles from '../styles.module.scss';

interface SensorChartsProps {
  sensor: Sensor;
  startDate: string;
  endDate: string;
}

function SensorCharts({ sensor, startDate, endDate }: SensorChartsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

  const truncPeriod = getTruncPeriod(new Date(startDate), new Date(endDate))!;

  const { formattedSensorReadings, ticks } = useFormattedSensorReadings({
    sensors: [sensor],
    startDate,
    endDate,
    truncPeriod,
  });

  if (!formattedSensorReadings) {
    return <div>Loading...</div>;
  }

  if (!truncPeriod || !sensor) {
    return <div>No data</div>;
  }

  return (
    <div className={styles.charts}>
      {SENSOR_CHART_PARAMS.flatMap((param) => {
        const data = formattedSensorReadings.find((data) => data.reading_type === param);

        // Skip the param if there's no corresponding data
        if (!data) {
          return [];
        }

        const { reading_type, unit, readings } = data;
        const color = STANDALONE_SENSOR_COLORS_MAP[param];

        return (
          <CustomLineChart
            key={reading_type}
            title={`${t(`SENSOR.READING.${reading_type.toUpperCase()}`)} (${unit})`}
            language={language || 'en'}
            lineConfig={[{ id: sensor.external_id, color }]}
            data={readings}
            ticks={ticks}
            truncPeriod={truncPeriod}
            formatTooltipValue={(_label, value) => {
              return typeof value === 'number' ? `${value}${unit}` : '';
            }}
            isCompactView={isCompactView}
            colors={{ title: color, yAxisTick: color }}
          />
        );
      })}
    </div>
  );
}

export default SensorCharts;
