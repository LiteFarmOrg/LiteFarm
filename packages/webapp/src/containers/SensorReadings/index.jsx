import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import { CURRENT_DATE_TIME, TEMPERATURE } from './constants';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { sensorsSelector } from '../sensorSlice';
import utils from '../WeatherBoard/utils';
import { measurementSelector } from '../../containers/userFarmSlice';
import styles from './styles.module.scss';
import { Semibold } from '../../components/Typography';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();

  const { location_id = '' } = match?.params;
  const sensorInfo = useSelector(sensorsSelector(location_id));
  const {
    latestMinTemperature = '',
    latestMaxTemperature = '',
    nearestStationName = '',
    lastUpdatedReadingsTime = '',
    predictedXAxisLabel = '',
    xAxisLabel = '',
    activeReadingTypes = [],
  } = useSelector(bulkSensorsReadingsSliceSelector);
  const measurementUnit = useSelector(measurementSelector);
  const { tempUnit } = utils.getUnits(measurementUnit);
  return (
    <div style={{ padding: '24px 16px 24px 24px', height: '100%' }}>
      <PageTitle
        title={sensorInfo.name}
        onGoBack={() => history.push('/map')}
        style={{ marginBottom: '24px' }}
      />
      <RouterTab
        classes={{ container: { margin: '30px 8px 26px 0px' } }}
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
        lastUpdatedTemperatureReadings={t(
          'SENSOR.TEMPERATURE_READINGS_OF_SENSOR.LAST_UPDATED_TEMPERATURE_READINGS',
          {
            latestReadingUpdate: lastUpdatedReadingsTime ?? '',
          },
        )}
        predictedXAxisLabel={predictedXAxisLabel}
        xAxisLabel={xAxisLabel}
        activeReadingTypes={activeReadingTypes}
      />
      {activeReadingTypes.length > 0 && (
        <>
          {activeReadingTypes.reduce((acc, cv, i) => {
            if (cv === TEMPERATURE) return acc;
            acc.push(
              <div key={i}>
                <div className={styles.titleWrapper}>
                  <label>
                    <Semibold className={styles.title}>{cv.replace(/_/g, ' ')}</Semibold>
                  </label>
                </div>
                <div className={styles.emptyRect}></div>
              </div>,
            );
            return acc;
          }, [])}
        </>
      )}
    </div>
  );
}

export default SensorReadings;
