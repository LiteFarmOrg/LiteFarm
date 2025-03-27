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
import { colors } from '../../../assets/theme';
import PageTitle from '../../../components/PageTitle/v2';
import SensorsDateRangeSelector from '../../../components/Sensor/v2/SensorsDateRange';
import SensorCharts from './Charts/SensorCharts';
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import { CustomRouteComponentProps } from '../../../types';
import { useGetSensorsQuery } from '../../../store/api/apiSlice';
import { SensorReadingTypes, SensorTypes } from '../../../store/api/types';
import LatestReadings from './LatestReadings';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

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

function SensorReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const { t } = useTranslation();

  const { startDate, endDate, startDateString, endDateString, dateRange, updateDateRange } =
    useSensorsDateRange({});

  const { sensor, sensorFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensor: data?.sensors?.find(({ external_id }) => external_id == match.params.id),
        sensorFetching: isFetching,
      };
    },
  });
  console.log({ sensor });

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

      <div className={styles.content}>
        {sensor && (
          <>
            <LatestReadings sensors={[sensor]} isSensorArray={false} />
            <div className={styles.mainData}>
              <SensorsDateRangeSelector
                dateRange={dateRange}
                updateDateRange={updateDateRange}
                className={styles.dateRangeSelector}
              />
              {startDate && endDate && startDateString && endDateString && (
                <SensorCharts
                  sensor={sensor}
                  startDate={startDate}
                  endDate={endDate}
                  startDateString={startDateString}
                  endDateString={endDateString}
                />
              )}
            </div>
          </>
        )}
      </div>
      <div>Manage ESci link</div>
    </Paper>
  );
}

export default SensorReadings;
