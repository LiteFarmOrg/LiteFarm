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
import { CustomRouteComponentProps } from '../../../types';
import { SensorType } from '../../../types/sensor';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

function SensorReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const { t } = useTranslation();

  const { startDate, endDate, dateRange, updateDateRange } = useSensorsDateRange({});

  const { sensor, isFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensor: data?.sensors?.find(({ external_id }) => external_id == match.params.id),
        isFetching,
      };
    },
  });

  if (!isFetching && !sensor) {
    history.replace('/unknown_record');
  }

  return (
    <Paper className={styles.paper}>
      <PageTitle
        title={t('SENSOR.STANDALONE_SENSOR')}
        onGoBack={history.back}
        classNames={{ wrapper: styles.title }}
      />
      {sensor && (
        <>
          <div className={styles.sensorInfo}>
            <div className={styles.sensorIdAndType}>
              <div className={styles.sensorId}>
                <SensorIcon />
                {sensor.external_id}
              </div>
              <div className={styles.deviceType}>
                {t(`SENSOR.DEVICE_TYPES.${toTranslationKey(sensor.name)}`)}
              </div>
            </div>
            <StatusIndicatorPill {...getStatusProps(sensor.last_seen, t)} />
          </div>
          <div className={styles.content}>
            <LatestReadings sensors={[sensor]} type={SensorType.SENSOR} />
            <div className={styles.sensorMainData}>
              <SensorsDateRangeSelector
                dateRange={dateRange}
                updateDateRange={updateDateRange}
                className={styles.dateRangeSelector}
              />
              {startDate && endDate && (
                <Charts sensors={[sensor]} startDate={startDate} endDate={endDate} />
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
