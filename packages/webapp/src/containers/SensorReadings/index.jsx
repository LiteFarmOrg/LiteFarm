import React from 'react';
import { useTranslation } from 'react-i18next';
import SensorReadingsLineChart from '../SensorReadingsLineChart';
import { CURRENT_DATE_TIME } from './constants';
import PageTitle from '../../components/PageTitle/v2';
import RouterTab from '../../components/RouterTab';

function SensorReadings({ history, match }) {
  const { t } = useTranslation();

  const { location_id = '' } = match?.params;

  return (
    <div style={{ padding: '24px 16px', height: '100%' }}>
      <PageTitle
        title={'Sensor Readings'}
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
        subTitle={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.SUBTITLE')}
        xAxisDataKey={CURRENT_DATE_TIME}
        yAxisLabel={t('SENSOR.TEMPERATURE_READINGS_OF_SENSOR.Y_AXIS_LABEL')}
        locationIds={[location_id]}
      />
    </div>
  );
}

export default SensorReadings;
