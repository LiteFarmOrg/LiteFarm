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
import { Sensor } from '../../../../store/api/types';
import type { ChartSupportedReadingTypes } from '../types';
import styles from '../styles.module.scss';

export interface ChartsProps {
  sensors: Sensor[];
  startDate: string;
  endDate: string;
  readingTypes: ChartSupportedReadingTypes[];
  getSensorColorMap: (readingType: ChartSupportedReadingTypes) => LineConfig[];
  getChartColors?: (readingType: ChartSupportedReadingTypes) => {
    title?: string;
    yAxisTick?: string;
  };
  className?: string;
}

const Charts = ({
  sensors,
  startDate,
  endDate,
  readingTypes,
  getSensorColorMap,
  getChartColors,
  className,
}: ChartsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

  const truncPeriod = getTruncPeriod(new Date(startDate), new Date(endDate))!;

  const { isLoading, isFetching, formattedSensorReadings, ticks } = useFormattedSensorReadings({
    sensors,
    startDate,
    endDate,
    truncPeriod,
    readingTypes,
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
    <div className={clsx(styles.charts, className)}>
      {isFetching && <OverlaySpinner />}
      {formattedSensorReadings.map(({ reading_type, unit, readings }) => {
        const lineConfig = getSensorColorMap(reading_type);
        const colors = getChartColors ? getChartColors(reading_type) : {};

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
