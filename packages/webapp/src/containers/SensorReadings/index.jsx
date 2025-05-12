import { useEffect, useState } from 'react';
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
import useLocationRouterTabs from '../LocationDetails/useLocationRouterTabs';
import { Variant } from '../../components/RouterTab/Tab';
import CardLayout from '../../components/Layout/CardLayout';
import useGroupedSensors from '../SensorList/useGroupedSensors';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { location_id } = match?.params || {};
  const [readingTypes, setReadingTypes] = useState([]);
  const [locationData, setLocationData] = useState();

  // Grandfathered sensors
  const sensorInfoFromStore = useSelector(sensorsSelector(location_id));

  const { groupedSensors } = useGroupedSensors();

  const sensorInfoFromGroupedSensors = groupedSensors.find((gs) => gs.location_id === location_id);

  const sensorInfo = sensorInfoFromStore || sensorInfoFromGroupedSensors;

  // Grandfathered sensors
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
    if (sensorInfo === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      setReadingTypes(reading_types?.reading_types);
    }
  }, [sensorInfo, reading_types]);

  //Runs the saga update store
  useEffect(() => {
    if (location_id && readingTypes?.length) {
      dispatch(
        getSensorsReadings({
          locationIds: [location_id],
          readingTypes,
        }),
      );
    }
  }, [readingTypes, location_id]);

  const routerTabs = sensorInfo && useLocationRouterTabs(sensorInfo, match);
  const pageTitle =
    sensorInfo.isAddonSensor && sensorInfo.type === 'sensor'
      ? sensorInfo.sensors[0].name
      : sensorInfo.name || '';

  return (
    <>
      {sensorInfo && !sensorInfo.deleted && (
        <CardLayout>
          <PageTitle title={pageTitle} onGoBack={() => history.push('/map')} />
          <RouterTab
            classes={{ container: { margin: '30px 8px 26px 8px' } }}
            history={history}
            tabs={routerTabs}
            variant={Variant.UNDERLINE}
          />
          {loading && (
            <div className={styles.loaderWrapper}>
              <Spinner />
            </div>
          )}
          {!loading && readingTypes?.includes(TEMPERATURE) && locationData?.temperature && (
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
        </CardLayout>
      )}
    </>
  );
}

export default SensorReadings;
