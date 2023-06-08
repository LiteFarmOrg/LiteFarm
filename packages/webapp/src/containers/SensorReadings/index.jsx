import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import ForecastInfo from './ForecastInfo';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import Spinner from '../../components/Spinner';
import { sensorsSelector } from '../sensorSlice';
import { sensorReadingTypesByLocationSelector } from '../../containers/sensorReadingTypesSlice';
import { getSensorsReadings } from '../SensorReadings/saga';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { TEMPERATURE } from './constants';
import styles from './styles.module.scss';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { location_id } = match?.params;
  const [readingTypes, setReadingTypes] = useState([]);
  const [locationData, setLocationData] = useState();

  const sensorInfo = useSelector(sensorsSelector(location_id));
  const reading_types = useSelector(sensorReadingTypesByLocationSelector(location_id));
  const { loading, sensorDataByLocationIds } = useSelector(bulkSensorsReadingsSliceSelector);

  //Keeps sensor readings up to date for location
  useEffect(() => {
    if (sensorDataByLocationIds[location_id] && location_id) {
      setLocationData(sensorDataByLocationIds[location_id]);
    }
  }, [sensorDataByLocationIds, location_id]);

  // Handles unknown records and keeping readingTypes up to date
  useEffect(() => {
    if (sensorInfo === undefined || reading_types === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      setReadingTypes(reading_types.reading_types);
    }
  }, [sensorInfo, reading_types]);

  //Runs the saga update store
  useEffect(() => {
    if (location_id && readingTypes.length) {
      dispatch(
        getSensorsReadings({
          locationIds: [location_id],
          readingTypes,
        }),
      );
    }
  }, [readingTypes, location_id]);

  return (
    <>
      {sensorInfo && !sensorInfo.deleted && (
        <div className={styles.container}>
          <PageTitle
            title={sensorInfo?.name || ''}
            onGoBack={() => history.push('/map')}
            style={{ marginBottom: '24px' }}
          />
          <RouterTab
            classes={{ container: { margin: '30px 8px 26px 8px' } }}
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
          {loading && (
            <div className={styles.loaderWrapper}>
              <Spinner />
            </div>
          )}
          {!loading && readingTypes.includes(TEMPERATURE) && locationData?.temperature && (
            <ForecastInfo data={locationData.temperature} />
          )}
          {!loading && locationData && readingTypes?.length > 0
            ? [...readingTypes]
                .sort()
                .reverse()
                .map((type) => {
                  return (
                    <SensorReadingsLineChart
                      readingType={type}
                      data={locationData[type]}
                      noDataFoundMessage={t('SENSOR.NO_DATA_FOUND')}
                      key={type}
                    />
                  );
                })
            : null}
        </div>
      )}
    </>
  );
}

export default SensorReadings;
