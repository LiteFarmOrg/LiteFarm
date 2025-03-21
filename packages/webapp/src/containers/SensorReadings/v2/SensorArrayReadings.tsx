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

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, useMediaQuery, useTheme } from '@mui/material';
import CustomLineChart from '../../../components/Charts/LineChart';
import { colors } from '../../../assets/theme';
import PageTitle from '../../../components/PageTitle/v2';
import SensorsDateRangeSelector from '../../../components/Sensor/v2/SensorsDateRange';
import useSensorsDateRange from '../../../components/Sensor/v2/SensorsDateRange/useSensorsDateRange';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import { formatSensorsData, getTruncPeriod } from './utils';
import { getTicks } from '../../../components/Charts/utils';
import { CustomRouteComponentProps } from '../../../types';
import {
  useGetSensorReadingsQuery,
  useGetSensorsQuery,
  useLazyGetSensorReadingsQuery,
} from '../../../store/api/apiSlice';
import { SensorReadings } from '../../../store/api/types';
import LatestReadings from './LatestReadings';
import { SENSOR_PARAMS } from './constants';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

const SENSORS = ['LSZDWX', 'WV2JHV', '8YH5Y5', 'BWKBAL'];

const LINE_COLORS = [
  colors['--Colors-Accent---singles-Blue-full'],
  colors['--Colors-Accent-Accent-yellow-600'],
  colors['--Colors-Primary-Primary-teal-700'],
  colors['--Colors-Accent---singles-Red-full'],
  colors['--Colors-Accent---singles-Purple-full'],
  colors['--Colors-Accent---singles-Brown-full'],
];

type ReadingsState = SensorReadings[] | undefined;

function SensorArrayReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const [validated, setValidated] = useState<boolean>(false);
  const [sensorReadings, setSensorReadings] = useState<ReadingsState>(undefined);

  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

  const { startDate, endDate, startDateString, endDateString, dateRange, updateDateRange } =
    useSensorsDateRange({});

  const { sensors, sensorFetching } = useGetSensorsQuery(undefined, {
    selectFromResult: ({ data, isFetching }) => {
      return {
        sensors: data?.sensors
          ?.filter(({ sensor_array_id }) => sensor_array_id == match.params.id)
          ?.sort((a, b) => a.depth - b.depth),
        sensorFetching: isFetching,
      };
    },
    // refetchOnMountOrArgChange: true,
  });
  console.log({ sensors });

  const truncPeriod = getTruncPeriod(startDateString, endDateString);

  const sensorIds = sensors?.map(({ external_id }) => external_id);

  const [triggerGetSensorReadings] = useLazyGetSensorReadingsQuery();

  const getAndSetSensorReadings = async (): Promise<void> => {
    if (sensorIds && truncPeriod) {
      const result = await triggerGetSensorReadings({
        esids: sensorIds.join(','),
        startTime: startDate,
        endTime: endDate,
        validated,
        truncPeriod,
      });
      if (result.data) {
        setSensorReadings(result.data);
      }
    }
  };

  useEffect(() => {
    if (!sensorReadings && sensorIds && truncPeriod) {
      getAndSetSensorReadings();
    }
  }, [sensorIds, truncPeriod]);

  const formattedData = useMemo(() => {
    if (!sensorReadings?.length || !truncPeriod) {
      return [];
    }

    const formatted = sensorReadings.map((data) => {
      return { ...data, readings: formatSensorsData(data.readings, truncPeriod, sensorIds!) };
    });

    if (truncPeriod === 'hour') {
      return formatted;
    }

    return formatted.map((data) => {
      return {
        ...data,
        readings: data.readings.map((reading) => {
          const timeDiff = new Date(reading.dateTime * 1000).getTimezoneOffset();

          return {
            ...reading,
            dateTime: reading.dateTime + timeDiff * 60,
          };
        }),
      };
    });
  }, [sensorReadings, sensorIds]);

  if (!sensorFetching && !sensors?.length) {
    history.replace('/unknown_record');
  }

  const renderCharts = () => {
    if (sensorReadings === undefined) {
      return <div>Loading...</div>;
    }

    if (!truncPeriod || !sensors?.length || !formattedData.length) {
      return <div>No data</div>;
    }

    return (
      <div className={styles.charts}>
        {SENSOR_PARAMS[sensors[0].name]?.flatMap((param) => {
          const data = formattedData.find((data) => data.reading_type === param);
          if (!data) {
            return [];
          }

          const { reading_type, unit, readings } = data;
          const ticks =
            startDateString && endDateString
              ? getTicks(startDateString, endDateString, {
                  skipEmptyEndTicks: true,
                  lastDataPointDateTime: readings[readings.length - 1].dateTime,
                })
              : undefined;

          return (
            <CustomLineChart
              key={reading_type}
              title={`${t(`SENSOR.READING.${reading_type.toUpperCase()}`)} (${unit})`}
              language={language || 'en'}
              lineConfig={sensors.map(({ external_id }, index) => ({
                id: external_id,
                color: LINE_COLORS[index],
              }))}
              data={readings}
              ticks={ticks}
              truncPeriod={truncPeriod}
              formatTooltipValue={(_label, value) => {
                return typeof value === 'number' ? `${value.toFixed(2)}${unit}` : '';
              }}
              isCompactView={isCompactView}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Paper className={styles.paper}>
      <PageTitle
        title={t('SENSOR.SENSOR_ARRAY')}
        onGoBack={history.back}
        classNames={{ wrapper: styles.title }}
      />
      <div style={{ margin: '8px 0' }}>
        <input
          id="validated"
          type="checkbox"
          onChange={() => setValidated(!validated)}
          checked={validated}
        />
        <label htmlFor="validated" style={{ paddingLeft: 8 }}>
          Validated
        </label>
      </div>

      <div className={styles.content}>
        {sensors && <LatestReadings sensors={sensors} isSensorArray={true} />}
        <div className={styles.mainData}>
          <SensorsDateRangeSelector
            dateRange={dateRange}
            updateDateRange={updateDateRange}
            className={styles.dateRangeSelector}
          />
          {renderCharts()}
        </div>
      </div>
      <div>Manage ESci link</div>
    </Paper>
  );
}

export default SensorArrayReadings;
