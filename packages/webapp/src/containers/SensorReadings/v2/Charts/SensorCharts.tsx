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
import { colors } from '../../../../assets/theme';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import { getTruncPeriod } from '../utils';
import { Sensor, SensorReadingTypes, SensorTypes } from '../../../../store/api/types';
import { SENSOR_PARAMS } from '../constants';
import styles from '../styles.module.scss';

export const STANDALONE_SENSOR_COLORS: Partial<
  Record<SensorTypes, Partial<Record<SensorReadingTypes, string>>>
> = {
  'Weather station': {
    temperature: colors.chartRed,
    relative_humidity: colors.chartBlue,
    rainfall_rate: colors.chartBlue,
    cumulative_rainfall: colors.chartGreen,
  },
  'Soil Water Potential Sensor': {
    temperature: colors.chartBlue,
    soil_water_potential: colors.chartRed,
  },
};

export const STANDALONE_SENSOR_COLORS_MAP: Partial<Record<SensorReadingTypes, string>> = {
  temperature: colors.chartRed,
  relative_humidity: colors.chartBlue,
  rainfall_rate: colors.chartYellow,
  cumulative_rainfall: colors.chartGreen,
  soil_water_potential: colors.chartBlue,
  soil_water_content: colors.chartPurple,
  water_pressure: colors.chartBrown,
};

interface SensorChartsProps {
  sensor: Sensor;
  startDate: string;
  endDate: string;
  startDateString: string;
  endDateString: string;
}

function SensorCharts({
  sensor,
  startDate,
  endDate,
  startDateString,
  endDateString,
}: SensorChartsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

  const truncPeriod = getTruncPeriod(startDateString, endDateString)!;

  const { formattedSensorReadings, ticks } = useFormattedSensorReadings({
    sensors: [sensor],
    startDate,
    endDate,
    startDateString,
    endDateString,
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
      {SENSOR_PARAMS.flatMap((param) => {
        const data = formattedSensorReadings.find((data) => data.reading_type === param);
        if (!data) {
          return [];
        }

        const { reading_type, unit, readings } = data;

        return (
          <CustomLineChart
            key={reading_type}
            title={`${t(`SENSOR.READING.${reading_type.toUpperCase()}`)} (${unit})`}
            language={language || 'en'}
            lineConfig={[
              {
                id: sensor.external_id,
                color: STANDALONE_SENSOR_COLORS[sensor.name]?.[reading_type]!,
              },
            ]}
            data={readings}
            ticks={ticks}
            truncPeriod={truncPeriod}
            formatTooltipValue={(_label, value) => {
              return typeof value === 'number' ? `${value}${unit}` : '';
            }}
            isCompactView={isCompactView}
          />
        );
      })}
    </div>
  );
}

export default SensorCharts;
