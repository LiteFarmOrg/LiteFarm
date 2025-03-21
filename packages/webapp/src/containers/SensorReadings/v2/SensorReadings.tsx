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

import { useMemo, useState } from 'react';
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
import { Sensor, SensorReadingTypes, SensorTypes } from '../../../store/api/types';
import LatestReadings from './LatestReadings';
import { SENSOR_PARAMS } from './constants';
import styles from './styles.module.scss';

interface RouteParams {
  id: string;
}

const LINE_COLORS: Partial<Record<SensorTypes, Partial<Record<SensorReadingTypes, string>>>> = {
  'Weather station': {
    temperature: colors['--Colors-Accent---singles-Red-full'],
    relative_humidity: colors['--Colors-Accent---singles-Blue-full'],
    rainfall_rate: colors['--Colors-Accent---singles-Blue-full'],
    cumulative_rainfall: colors['--Colors-Primary-Primary-teal-700'],
  },
  'Soil Water Potential Sensor': {
    temperature: colors['--Colors-Accent---singles-Blue-full'],
    soil_water_potential: colors['--Colors-Accent---singles-Red-full'],
  },
};

function SensorReadings({ match, history }: CustomRouteComponentProps<RouteParams>) {
  const [validated, setValidated] = useState<boolean>(false);

  const { t } = useTranslation();
  const theme = useTheme();
  const isCompactView = useMediaQuery(theme.breakpoints.down('sm'));
  const language = getLanguageFromLocalStorage();

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

  const truncPeriod = getTruncPeriod(startDateString, endDateString);

  const { data: refetchedData, isLoading } = useGetSensorReadingsQuery(
    {
      esids: sensor?.external_id!, // TODO: Fix
      startTime: startDate,
      endTime: endDate,
      validated,
      // truncPeriod,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [triggerGetSensorReadings] = useLazyGetSensorReadingsQuery();

  const formattedData = useMemo(() => {
    if (!refetchedData || !truncPeriod || !sensor) {
      return [];
    }

    const formatted = refetchedData.map((data) => {
      return {
        ...data,
        readings: formatSensorsData(data.readings, truncPeriod, [sensor.external_id]),
      };
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
  }, [refetchedData]);

  if (!sensorFetching && !sensor) {
    history.replace('/unknown_record');
  }

  const renderCharts = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!truncPeriod || !sensor) {
      return <div>No data</div>;
    }

    return (
      <div className={styles.charts}>
        {SENSOR_PARAMS[sensor.name]?.flatMap((param) => {
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
              lineConfig={[
                {
                  id: sensor.external_id, //sensor.external_id,
                  color: LINE_COLORS[sensor.name]?.[reading_type]!,
                },
              ]}
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
        title={t('SENSOR.STANDALONE_SENSOR')}
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
        {sensor && <LatestReadings sensors={[sensor]} isSensorArray={false} />}
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

export default SensorReadings;
