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

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import SensorsDateRangeSelector from '../../../components/Sensor/v2/SensorsDateRange';
import LatestReadings from './LatestReadings';
import Charts, { ChartsProps } from './Charts';
import { StatusIndicatorPill } from '../../../components/StatusIndicatorPill';
import { ReactComponent as SensorIcon } from '../../../assets/images/map/signal-01.svg';
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import ManageESciSection from '../../../components/ManageESciSection';
import { useGetSensorsQuery } from '../../../store/api/apiSlice';
import { getStatusProps } from './utils';
import { toTranslationKey } from '../../../util';
import {
  LINE_COLORS,
  SENSOR_ARRAY_CHART_PARAMS,
  SENSOR_READING_TYPES,
  STANDALONE_SENSOR_COLORS_MAP,
} from './constants';
import type { CustomRouteComponentProps } from '../../../types';
import type { ChartSupportedReadingTypes } from './types';
import { SensorType } from '../../../types/sensor';
import { Sensor } from '../../../store/api/types';
import styles from './styles.module.scss';
import layoutStyles from '../../../components/Layout/layout.module.scss';

interface RouteParams {
  id: string;
}

interface SensorReadingsProps extends CustomRouteComponentProps<RouteParams> {
  type: SensorType;
}

const generateSensorArrayColorMap = (sensors: Sensor[]) => {
  return sensors.map(({ external_id }, index) => ({
    id: external_id,
    color: LINE_COLORS[index],
  }));
};

const filterSensors = (id: string, type: SensorType, sensors?: Sensor[]): Sensor[] | undefined => {
  return type === SensorType.SENSOR_ARRAY
    ? sensors
        ?.filter(({ sensor_array_id }) => sensor_array_id == id)
        ?.sort((a, b) => a.depth - b.depth)
    : sensors?.filter(({ external_id }) => external_id === id);
};

const getSensorReadingTypeColor = (readingType: ChartSupportedReadingTypes): string => {
  return STANDALONE_SENSOR_COLORS_MAP[readingType];
};

const getSensorColorMapFunc =
  (id: Sensor['external_id']): ChartsProps['getSensorColorMap'] =>
  (readingType: ChartSupportedReadingTypes) => {
    return [{ id, color: getSensorReadingTypeColor(readingType) }];
  };

const getChartColors: ChartsProps['getChartColors'] = (readingType: ChartSupportedReadingTypes) => {
  const paramColor = getSensorReadingTypeColor(readingType);
  return { title: paramColor, yAxisTick: paramColor };
};

const getChartsProps = (type: SensorType, sensors: Sensor[]) => {
  if (type === SensorType.SENSOR_ARRAY) {
    return {
      readingTypes: SENSOR_ARRAY_CHART_PARAMS,
      getSensorColorMap: () => generateSensorArrayColorMap(sensors),
    };
  }

  return {
    readingTypes: SENSOR_READING_TYPES[sensors[0].name],
    getSensorColorMap: getSensorColorMapFunc(sensors[0].external_id),
    getChartColors,
    className: styles.sensor,
  };
};

const PAGE_TITLE_KEY = {
  [SensorType.SENSOR_ARRAY]: 'SENSOR.SENSOR_ARRAY',
  [SensorType.SENSOR]: 'SENSOR.STANDALONE_SENSOR',
};

const SensorReadings = ({ match, history, type }: SensorReadingsProps) => {
  const { t } = useTranslation();

  const { startDate, endDate, dateRange, updateDateRange } = useSensorsDateRange({});

  // For SensorType.SENSOR, sensors always becomes an array of 0 or 1
  const { sensors, isFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensors: filterSensors(match.params.id, type, data?.sensors),
        isFetching,
      };
    },
  });

  useEffect(() => {
    if (!isFetching && !sensors?.length) {
      history.replace('/unknown_record');
    }
  }, [isFetching, sensors?.length, history]);

  return (
    <Layout className={layoutStyles.paperContainer}>
      <PageTitle
        title={t(PAGE_TITLE_KEY[type])}
        onGoBack={history.back}
        classNames={{ wrapper: styles.title }}
      />
      {!!sensors?.length && (
        <>
          {type === SensorType.SENSOR && (
            <div className={styles.sensorInfo}>
              <div className={styles.sensorIdAndType}>
                <div className={styles.sensorId}>
                  <SensorIcon />
                  {sensors[0].external_id}
                </div>
                <div className={styles.deviceType}>
                  {t(`SENSOR.DEVICE_TYPES.${toTranslationKey(sensors[0].name)}`)}
                </div>
              </div>
              <StatusIndicatorPill {...getStatusProps(sensors[0].last_seen, t)} />
            </div>
          )}
          <div className={styles.content}>
            <LatestReadings
              sensors={sensors}
              {...(type === SensorType.SENSOR
                ? { type }
                : { type, sensorColorMap: generateSensorArrayColorMap(sensors) })}
            />
            <div className={clsx(styles.dateAndChart, styles[type])}>
              <SensorsDateRangeSelector
                dateRange={dateRange}
                updateDateRange={updateDateRange}
                className={styles.dateRangeSelector}
              />
              {startDate && endDate && (
                <Charts
                  sensors={sensors}
                  startDate={startDate}
                  endDate={endDate}
                  {...getChartsProps(type, sensors)}
                />
              )}
            </div>
          </div>
        </>
      )}
      <ManageESciSection t={t} />
    </Layout>
  );
};

export default SensorReadings;
