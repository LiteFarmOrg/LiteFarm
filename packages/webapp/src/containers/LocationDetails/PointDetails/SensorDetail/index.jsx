import PureSensorDetail from '../../../../components/LocationDetailLayout/Sensor/SensorDetail/index';
import { measurementSelector } from '../../../userFarmSlice';
import { tasksFilterSelector } from '../../../filterSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { sensorsSelector } from '../../../sensorSlice';
import { isAdminSelector } from '../../../userFarmSlice';
import { getSensorReadingTypes, getSensorBrand } from './saga';

export default function Detail({ history, user, match }) {
  const dispatch = useDispatch();
  const location_id = match.params.location_id;
  const sensorInfo = useSelector(sensorsSelector(location_id));

  const { sensor_id, partner_id } = sensorInfo;
  useEffect(() => {
    dispatch(getSensorReadingTypes({ location_id, sensor_id }));
    dispatch(getSensorBrand({ location_id, partner_id }));
  });

  const system = useSelector(measurementSelector);

  const { t } = useTranslation();

  const isAdmin = useSelector(isAdminSelector);

  return (
    <PureSensorDetail history={history} isAdmin={isAdmin} system={system} sensorInfo={sensorInfo} />
  );
}
