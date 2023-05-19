import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import {
  CURRENT_DATE_TIME,
  SOIL_WATER_POTENTIAL,
  SOIL_WATER_CONTENT,
  TEMPERATURE,
} from './constants';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { sensorsSelector } from '../sensorSlice';
import { ambientTemperature, soilWaterPotential } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
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
  const [readingTypes, setReadingTypes] = useState([]);
  const unitSystem = useSelector(measurementSelector);
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
            units: getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].label,
          }),
          weatherStationName: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.WEATHER_STATION', {
            weatherStationLocation: nearestStationName,
          }),
          yAxisLabel: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
            units: getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].label,
          }),
          ambientTempFor: t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.AMBIENT_TEMPERATURE_FOR'),
        },
        [SOIL_WATER_POTENTIAL]: {
          title: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.TITLE'),
          yAxisLabel: t('SENSOR.SOIL_WATER_POTENTIAL_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
            units: getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].label,
          }),
        },
        [SOIL_WATER_CONTENT]: {
          title: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.TITLE'),
          yAxisLabel: t('SENSOR.SOIL_WATER_CONTENT_READINGS_OF_SENSOR.Y_AXIS_LABEL', {
            units: '%',
          }),
        },
      });
    }
  }, [sensorInfo, reading_types, history, latestMaxTemperature, latestMinTemperature]);

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
                  const { title, subTitle, weatherStationName, yAxisLabel, ambientTempFor } =
                    sensorVisualizationPropList[type];
                  return (
                    <SensorReadingsLineChart
                      key={index}
                      title={title}
                      subTitle={subTitle}
                      weatherStationName={weatherStationName}
                      xAxisDataKey={CURRENT_DATE_TIME}
                      yAxisLabel={yAxisLabel}
                      locationIds={[location_id]}
                      readingType={type}
                      noDataText={t('SENSOR.NO_DATA')}
                      ambientTempFor={ambientTempFor}
                      lastUpdatedReadings={
                        lastUpdatedReadingsTime[type] !== ''
                          ? t('SENSOR.LAST_UPDATED', {
                              latestReadingUpdate: lastUpdatedReadingsTime[type] ?? '',
                            })
                          : ''
                      }
                      predictedXAxisLabel={predictedXAxisLabel}
                      xAxisLabel={xAxisLabel[type]}
                      activeReadingTypes={readingTypes}
                      noDataFoundMessage={t('SENSOR.NO_DATA_FOUND')}
                    />
                  );
                })
            : null}
          {readingTypes?.length > 0 && (
            <>
              {readingTypes.reduce((acc, cv, i) => {
                if (cv === TEMPERATURE || cv === SOIL_WATER_POTENTIAL || cv === SOIL_WATER_CONTENT)
                  return acc;
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
