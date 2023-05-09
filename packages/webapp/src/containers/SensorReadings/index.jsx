import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { sensorsSelector } from '../sensorSlice';
import { sensorReadingTypesByLocationSelector } from '../../containers/sensorReadingTypesSlice';
import { getSensorsReadings } from '../SensorReadings/saga';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { location_id } = match?.params;
  const [readingTypes, setReadingTypes] = useState([]);

  const sensorInfo = useSelector(sensorsSelector(location_id));
  const reading_types = useSelector(sensorReadingTypesByLocationSelector(location_id));

  useEffect(() => {
    if (sensorInfo === undefined || reading_types === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      setReadingTypes(reading_types.reading_types);
    }
  }, [sensorInfo, reading_types]);

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
                ?.map((type) => {
                  return (
                    <SensorReadingsLineChart
                      readingType={type}
                      noDataText={t('SENSOR.NO_DATA')}
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
