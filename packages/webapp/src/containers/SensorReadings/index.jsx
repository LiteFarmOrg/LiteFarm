import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import { CURRENT_DATE_TIME, SOIL_WATER_POTENTIAL, TEMPERATURE } from './constants';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { sensorsSelector } from '../sensorSlice';
import utils from '../WeatherBoard/utils';
import { measurementSelector } from '../../containers/userFarmSlice';
import styles from './styles.module.scss';
import { Semibold } from '../../components/Typography';
import { sensorReadingTypesByLocationSelector } from '../../containers/sensorReadingTypesSlice';

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
    xAxisLabel = {},
  } = useSelector(bulkSensorsReadingsSliceSelector);
  const measurementUnit = useSelector(measurementSelector);
  const { tempUnit, soilWaterPotentialUnit } = utils.getUnits(measurementUnit);
  const [readingTypes, setReadingTypes] = useState([]);
  const reading_types = useSelector(sensorReadingTypesByLocationSelector(location_id));
  const [sensorVisualizationPropList, setSensorVisualizationPropList] = useState({});

  useEffect(() => {
    if (sensorInfo === undefined || reading_types === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      const loadedReadingTypes = reading_types.reading_types;
      setReadingTypes(loadedReadingTypes);
      setSensorVisualizationPropList({
        [TEMPERATURE]: {
          title: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.TITLE'),
          subTitle: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.SUBTITLE', {
            high: latestMaxTemperature,
            low: latestMinTemperature,
            tempUnit: tempUnit ?? 'C',
          }),
          weatherStationName: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.WEATHER_STATION', {
            weatherStationLocation: nearestStationName,
          }),

          xAxisDataKey: CURRENT_DATE_TIME,
          yAxisLabel: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
            tempUnit: tempUnit ?? 'C',
          }),
          noDataText: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.NO_DATA'),
          ambientTempFor: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.AMBIENT_TEMPERATURE_FOR'),
          predictedXAxisLabel: predictedXAxisLabel,
          activeReadingTypes: loadedReadingTypes,
        },
        [SOIL_WATER_POTENTIAL]: {
          title: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.TITLE'),
          subTitle: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.SUBTITLE', {
            high: latestMaxTemperature,
            low: latestMinTemperature,
            soilWaterPotentialUnit: soilWaterPotentialUnit ?? 'kPa',
          }),
          xAxisDataKey: CURRENT_DATE_TIME,
          yAxisLabel: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
            soilWaterPotentialUnit: soilWaterPotentialUnit ?? 'kPa',
          }),
          noDataText: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.NO_DATA'),
          predictedXAxisLabel: predictedXAxisLabel,
          activeReadingTypes: loadedReadingTypes,
        },
      });
    }
  }, [sensorInfo, reading_types, history]);

  return (
    <>
      {sensorInfo && !sensorInfo.deleted && (
        <div style={{ padding: '24px 16px 24px 24px', height: '100%' }}>
          <PageTitle
            title={sensorInfo?.name || ''}
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
          {readingTypes?.length > 0
            ? [...readingTypes]
                ?.sort()
                ?.reverse()
                ?.map((type, index) => {
                  if (!sensorVisualizationPropList[type]) {
                    return null;
                  }
                  const {
                    title,
                    subTitle,
                    weatherStationName,
                    xAxisDataKey,
                    yAxisLabel,
                    noDataText,
                    ambientTempFor,
                    predictedXAxisLabel,
                    activeReadingTypes,
                  } = sensorVisualizationPropList[type];
                  return (
                    <SensorReadingsLineChart
                      key={index}
                      title={title}
                      subTitle={subTitle}
                      weatherStationName={weatherStationName}
                      xAxisDataKey={xAxisDataKey}
                      yAxisLabel={yAxisLabel}
                      locationIds={[location_id]}
                      readingType={type}
                      noDataText={noDataText}
                      ambientTempFor={ambientTempFor}
                      lastUpdatedReadings={
                        lastUpdatedReadingsTime[type] !== ''
                          ? t(
                              'SENSOR.TEMPERATURE_READINGS_OF_SENSOR.LAST_UPDATED_TEMPERATURE_READINGS',
                              { latestReadingUpdate: lastUpdatedReadingsTime[type] ?? '' },
                            )
                          : ''
                      }
                      predictedXAxisLabel={predictedXAxisLabel}
                      xAxisLabel={xAxisLabel[type]}
                      activeReadingTypes={activeReadingTypes}
                      noDataFoundMessage={t('SENSOR.NO_DATA_FOUND')}
                    />
                  );
                })
            : null}
          {readingTypes?.length > 0 && (
            <>
              {readingTypes.reduce((acc, cv, i) => {
                if (cv === TEMPERATURE || cv === SOIL_WATER_POTENTIAL) return acc;
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
      )}
    </>
  );
}

export default SensorReadings;
