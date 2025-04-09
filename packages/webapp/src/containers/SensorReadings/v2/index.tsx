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
import clsx from 'clsx';
import { Paper } from '@mui/material';
import PageTitle from '../../../components/PageTitle/v2';
import SensorsDateRangeSelector from '../../../components/Sensor/v2/SensorsDateRange';
import LatestReadings from './LatestReadings';
import Charts from './Charts';
import { StatusIndicatorPill } from '../../../components/StatusIndicatorPill';
import { ReactComponent as SensorIcon } from '../../../assets/images/map/signal-01.svg';
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import { useGetSensorsQuery } from '../../../store/api/apiSlice';
import { getStatusProps } from './utils';
import { toTranslationKey } from '../../../util';
import { LINE_COLORS } from './constants';
import { CustomRouteComponentProps } from '../../../types';
import { SensorType } from '../../../types/sensor';
import { Sensor } from '../../../store/api/types';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

interface SensorReadingsProps extends CustomRouteComponentProps<RouteParams> {
  type: SensorType;
}

const generateSensorColorMap = (sensors: Sensor[]) => {
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

const PAGE_TITLE_KEY = {
  [SensorType.SENSOR_ARRAY]: 'SENSOR.SENSOR_ARRAY',
  [SensorType.SENSOR]: 'SENSOR.STANDALONE_SENSOR',
};

function SensorReadings({ match, history, type }: SensorReadingsProps) {
  const { t } = useTranslation();

  const { startDate, endDate, dateRange, updateDateRange } = useSensorsDateRange({});

  const { sensors, isFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensors: filterSensors(match.params.id, type, data?.sensors),
        isFetching,
      };
    },
    // refetchOnMountOrArgChange: true, // TODO: confirm
  });

  if (!isFetching && !sensors?.length) {
    history.replace('/unknown_record');
  }

  return (
    <Paper className={styles.paper}>
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
                : { type, sensorColorMap: generateSensorColorMap(sensors) })}
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
                  sensorColorMap={
                    type === SensorType.SENSOR_ARRAY ? generateSensorColorMap(sensors) : undefined
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
      <div>Manage ESci link</div>
    </Paper>
  );
}

export default SensorReadings;
