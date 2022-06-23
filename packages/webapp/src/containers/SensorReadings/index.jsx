import React, { useEffect } from 'react';
// import PureRoleSelection from '../../components/RoleSelection';
import { useDispatch, useSelector } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';
// import { roleToId } from './roleMap';
import { useTranslation } from 'react-i18next';
// import { userFarmSelector } from '../userFarmSlice';
import { getSensorsTempratureReadings } from './saga';
import ReadingsLineChart from '../../components/ReadingsLineChart';
import { bulkSensorsReadingsSliceSelector } from '../../containers/bulkSensorReadingsSlice';
import { colors } from './constants';

function SensorReadings({
  sensorsList = [
    {
      sensor_name: 'aa',
      lat: 48.4413361,
      lon: -123.2946138,
    },
    {
      sensor_name: 'bbb',
      lat: 19.10743185484748,
      lon: 72.90937162305781,
    },
    {
      sensor_name: 'cc',
      lat: 25.08053964037619,
      lon: 55.18902959316284,
    },
  ],
}) {
  const { t } = useTranslation();
  // const { role, owner_operated } = useSelector(userFarmSelector);
  const dispatch = useDispatch();

  // const onSubmit = ({ role, owner_operated }) => {
  //   const callback = () => history.push('/consent');
  //   dispatch(patchRole({ role, owner_operated, role_id: roleToId[role], callback }));
  // };

  const onGoBack = () => {
    history.push('/add_farm');
  };

  useEffect(() => {
    console.log('this is called in useEffect');
    dispatch(getSensorsTempratureReadings(sensorsList));
  }, []);

  const bulkSensorsReadingsSliceSelectorData = useSelector(bulkSensorsReadingsSliceSelector);
  console.log('bulkSensorsReadingsSliceSelectorData', bulkSensorsReadingsSliceSelectorData);
  return (
    <>
      {bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature?.length && (
        <ReadingsLineChart
          yAxisDataKeys={sensorsList.map((s) => s.sensor_name)}
          chartData={bulkSensorsReadingsSliceSelectorData?.sensorsReadingsOfTemperature}
          xAxisDataKey="current_date_time"
          lineColors={colors}
        />
      )}
    </>
    // <PureRoleSelection
    //   onSubmit={onSubmit}
    //   onGoBack={onGoBack}
    //   title={t('ROLE_SELECTION.TITLE')}
    //   defaultRole={role}
    //   defaultOwnerOperated={owner_operated}
    // />
  );
}

export default SensorReadings;
