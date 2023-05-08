import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';
import { bulkSensorsReadingsSliceSelector } from '../bulkSensorReadingsSlice';
import { sensorsSelector } from '../sensorSlice';
import { sensorReadingTypesByLocationSelector } from '../../containers/sensorReadingTypesSlice';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();
  const { location_id = '' } = match?.params;
  const [readingTypes, setReadingTypes] = useState([]);

  const sensorInfo = useSelector(sensorsSelector(location_id));
  const derivedSensorInfo = useSelector(bulkSensorsReadingsSliceSelector);
  const reading_types = useSelector(sensorReadingTypesByLocationSelector(location_id));

  useEffect(() => {
    if (sensorInfo === undefined || reading_types === undefined || sensorInfo?.deleted) {
      history.replace('/unknown_record');
    } else {
      setReadingTypes(reading_types.reading_types);
    }
  }, [sensorInfo, reading_types]);

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
                      locationIds={[location_id]}
                      readingType={type}
                      derivedSensorInfo={derivedSensorInfo}
                      noDataText={t('SENSOR.NO_DATA')}
                      activeReadingTypes={readingTypes}
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
