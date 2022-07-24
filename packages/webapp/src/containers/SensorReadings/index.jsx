import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import { CURRENT_DATE_TIME } from './constants';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { sensorsSelector } from '../sensorSlice';
import utils from '../WeatherBoard/utils';
import { TEMPERATURE } from './constants';
import { measurementSelector } from '../../containers/userFarmSlice';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();

  const { location_id = '' } = match?.params;
  const sensorInfo = useSelector(sensorsSelector(location_id));
  const {
    latestMinTemperature = '',
    latestMaxTemperature = '',
    nearestStationName = '',
  } = useSelector(bulkSensorsReadingsSliceSelector);
  const measurementUnit = useSelector(measurementSelector);
  const { tempUnit } = utils.getUnits(measurementUnit);
  return (
    <div style={{ padding: '24px 16px', height: '100%' }}>
      <PageTitle
        title={sensorInfo.name}
        onGoBack={() => history.push('/map')}
        style={{ marginBottom: '24px' }}
      />
      <RouterTab
        classes={{ container: { margin: '24px 0' } }}
        history={history}
        tabs={[
          {
            label: t('SENSOR.VIEW_HEADER.READINGS'),
            path: `/sensor/${location_id}/readings`,
          },
          {
            label: t('SENSOR.VIEW_HEADER.TASKS'),
            path: `/sensor/${location_id}/tasks`,
          },
          {
            label: t('SENSOR.VIEW_HEADER.DETAILS'),
            path: `/sensor/${location_id}/details`,
          },
        ]}
      />
      <SensorReadingsLineChart
        title={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.TITLE')}
        subTitle={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.SUBTITLE', {
          high: latestMaxTemperature,
          low: latestMinTemperature,
          tempUnit: tempUnit ?? 'C',
        })}
        weatherStationName={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.WEATHER_STATION', {
          weatherStationLocation: nearestStationName,
        })}
        xAxisDataKey={CURRENT_DATE_TIME}
        yAxisLabel={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
          tempUnit: tempUnit ?? 'C',
        })}
        locationIds={[location_id]}
        readingType={TEMPERATURE}
        noDataText={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.NO_DATA')}
        ambientTempFor={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.AMBIENT_TEMPERATURE_FOR')}
      />
    </div>
  );
}

export default SensorReadings;
