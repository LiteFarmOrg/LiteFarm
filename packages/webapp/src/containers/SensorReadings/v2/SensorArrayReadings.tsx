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
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import { CustomRouteComponentProps } from '../../../types';
import { useGetSensorsQuery } from '../../../store/api/apiSlice';
import LatestReadings from './LatestReadings';
import Charts from './Charts/SensorArrayCharts';
import { colors } from '../../../assets/theme';
import styles from './styles.module.scss';

export const LINE_COLORS = [
  colors.chartBlue,
  colors.chartYellow,
  colors.chartGreen,
  colors.chartRed,
  colors.chartPurple,
  colors.chartBrown,
];

interface RouteParams {
  id: string;
}

function SensorArrayReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const { t } = useTranslation();

  const { startDate, endDate, dateRange, updateDateRange } = useSensorsDateRange({});

  const { sensors, isFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensors: data?.sensors
          ?.filter(({ sensor_array_id }) => sensor_array_id == match.params.id)
          ?.sort((a, b) => a.depth - b.depth),
        isFetching,
      };
    },
    // refetchOnMountOrArgChange: true,
  });

  if (!isFetching && !sensors?.length) {
    history.replace('/unknown_record');
  }

  const sensorColorMap = sensors?.map(({ external_id }, index) => ({
    id: external_id,
    color: LINE_COLORS[index],
  }));

  return (
    <Paper className={styles.paper}>
      <PageTitle
        title={t('SENSOR.SENSOR_ARRAY')}
        onGoBack={history.back}
        classNames={{ wrapper: styles.title }}
      />
      <div className={styles.content}>
        {sensors?.length && (
          <>
            <LatestReadings
              sensors={sensors}
              isSensorArray={true}
              sensorColorMap={sensorColorMap!}
            />
            <div className={styles.mainData}>
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
                  sensorColorMap={sensorColorMap!}
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

export default SensorArrayReadings;
