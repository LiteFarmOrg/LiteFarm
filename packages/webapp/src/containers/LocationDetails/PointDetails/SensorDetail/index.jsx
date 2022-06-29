import PureSensorDetail from '../../../../components/LocationDetailLayout/Sensor/SensorDetail/index';
import { measurementSelector } from '../../../userFarmSlice';
import { tasksFilterSelector } from '../../../filterSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { sensorsSelector } from '../../../sensorSlice';
import { isAdminSelector } from '../../../userFarmSlice';
import { getSensorReadingTypes } from './saga';

export default function Detail({ history, user, match }) {
  const dispatch = useDispatch();
  const location_id = match.params.location_id;
  const sensorInfo = useSelector(sensorsSelector(location_id));

  const { partner_id } = sensorInfo;
  useEffect(() => {
    dispatch(getSensorReadingTypes(location_id, partner_id));
  });

  const tasksFilter = useSelector(tasksFilterSelector);

  const system = useSelector(measurementSelector);

  const { t } = useTranslation();

  const SOIL_WATER_CONTENT = 'Soil water content';
  const SOIL_WATER_POTENTIAL = 'Soil water potential';
  const TEMPERATURE = 'Temperature';

  const statuses = [SOIL_WATER_CONTENT, SOIL_WATER_POTENTIAL, TEMPERATURE];

  const STATUS = 'STATUS';
  const filterRef = useRef({});

  const filter = {
    subject: t('SENSOR.DETAIL.READING_TYPES'),
    filterKey: STATUS,
    options: statuses.map((status) => ({
      value: status.toLowerCase(),
      default: tasksFilter[STATUS][status.toLowerCase()]?.active ?? true,
      label: status,
    })),
  };

  const isAdmin = useSelector(isAdminSelector);

  return (
    <PureSensorDetail
      history={history}
      isAdmin={isAdmin}
      match={match}
      system={system}
      filter={filter}
      filterRef={filterRef}
      tasksFilter={tasksFilter}
      sensorInfo={sensorInfo}
    />
  );
}
