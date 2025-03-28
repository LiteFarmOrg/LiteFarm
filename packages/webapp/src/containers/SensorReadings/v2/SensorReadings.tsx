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
import i18n from '../../../locales/i18n';
import PageTitle from '../../../components/PageTitle/v2';
import SensorsDateRangeSelector from '../../../components/Sensor/v2/SensorsDateRange';
import { Status, StatusIndicatorPill } from '../../../components/StatusIndicatorPill';
import SensorCharts from './Charts/SensorCharts';
import { ReactComponent as SensorIcon } from '../../../assets/images/map/signal-01.svg';
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import { toTranslationKey } from '../../../util';
import { CustomRouteComponentProps } from '../../../types';
import { useGetSensorsQuery } from '../../../store/api/apiSlice';
import LatestReadings from './LatestReadings';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

function SensorReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const { t } = useTranslation();

  const { startDate, endDate, dateRange, updateDateRange } = useSensorsDateRange({});

  const { sensor, sensorFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensor: data?.sensors?.find(({ external_id }) => external_id == match.params.id),
        sensorFetching: isFetching,
      };
    },
  });

  if (!sensorFetching && !sensor) {
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
                {i18n.exists(`SENSOR.DEVICE_TYPES.${toTranslationKey(sensor.name)}`)
                  ? t(`SENSOR.DEVICE_TYPES.${toTranslationKey(sensor.name)}`)
                  : sensor.name}
              </div>
            </div>
            <StatusIndicatorPill status={Status.ONLINE} pillText={t('STATUS.ONLINE')} />
          </div>
          <div className={styles.content}>
            <LatestReadings sensors={[sensor]} isSensorArray={false} />
            <div className={styles.mainData}>
              <SensorsDateRangeSelector
                dateRange={dateRange}
                updateDateRange={updateDateRange}
                className={styles.dateRangeSelector}
              />
              {startDate && endDate && (
                <SensorCharts sensor={sensor} startDate={startDate} endDate={endDate} />
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
