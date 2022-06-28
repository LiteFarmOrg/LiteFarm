import EditSensor from '../../../../components/Sensor/EditSensor';
import { managementPlanSelector } from '../../../managementPlanSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { useTranslation } from 'react-i18next';
import { sensorsSelector } from '../../../sensorSlice';
import { tasksFilterSelector } from '../../../filterSlice';
import { useRef } from 'react';
import produce from 'immer';
import { patchSensor } from './saga';
import { getProcessedFormData } from '../../../hooks/useHookFormPersist/utils';

import { useSelector, useDispatch } from 'react-redux';

export default function UpdateSensor({ history, match }) {
  const dispatch = useDispatch();
  const location_id = match.params.location_id;

  const tasksFilter = useSelector(tasksFilterSelector);

  const sensorInfo = useSelector(sensorsSelector(location_id));
  console.log(sensorInfo);

  const system = useSelector(measurementSelector);

  const onBack = () => {
    history.push(`/sensor/${location_id}/details`);
  };

  const { t } = useTranslation();

  const SOIL_WATER_CONTENT = 'SOIL_WATER_CONTENT';
  const SOIL_WATER_POTENTIAL = 'SOIL_WATER_POTENTIAL';
  const TEMPERATURE = 'TEMPERATURE';

  const statuses = [SOIL_WATER_CONTENT, SOIL_WATER_POTENTIAL, TEMPERATURE];

  const STATUS = 'STATUS';
  const filterRef = useRef({});

  const filter = {
    subject: t('SENSOR.READING.TYPES'),
    filterKey: STATUS,
    options: statuses.map((status) => ({
      value: status.toLowerCase(),
      default: tasksFilter[STATUS][status.toLowerCase()]?.active ?? false,
      label: t(`SENSOR.READING.${status}`),
    })),
  };

  const onSubmit = (data) => {
    const sensorData = produce(data, (data) => {
      data.sensor_id = sensorInfo.sensor_id;
      data.farm_id = sensorInfo.farm_id;
      data.location_id = sensorInfo.location_id;
    });
    dispatch(patchSensor(getProcessedFormData(sensorData)));
    console.log(sensorData);
  };

  return (
    <>
      <EditSensor
        onSubmit={onSubmit}
        onBack={onBack}
        history={history}
        match={match}
        system={system}
        filter={filter}
        filterRef={filterRef}
        sensorInfo={sensorInfo}
      />
    </>
  );
}
