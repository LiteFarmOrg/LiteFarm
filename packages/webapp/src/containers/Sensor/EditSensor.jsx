import EditSensor from '../../components/Sensor/EditSensor';
import { managementPlanSelector } from '../managementPlanSlice';
import { measurementSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import { tasksFilterSelector } from '../filterSlice';
import { useRef } from 'react';

import { useSelector } from 'react-redux';

export default function UpdateSensor({ history, match }) {
  const management_plan_id = match.params.management_plan_id;

  const plan = useSelector(managementPlanSelector(management_plan_id));
  const tasksFilter = useSelector(tasksFilterSelector);

  const system = useSelector(measurementSelector);

  const onBack = () => {
    history.push(`/`);
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
    // const sensorData = produce(data, (data) => {
    //   data.management_plan_id = management_plan_id;
    //   data.crop_management_plan &&
    //     (data.crop_management_plan.management_plan_id = management_plan_id);
    //   data.crop_variety_id = variety_id;
    // });
    // dispatch(patchSensor(getProcessedFormData(sensorData)));
  };

  return (
    <>
      <EditSensor
        onSubmit={onSubmit}
        onBack={onBack}
        history={history}
        match={match}
        plan={plan}
        system={system}
        filter={filter}
        filterRef={filterRef}
      />
    </>
  );
}
