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

  const SOIL_WATER_CONTENT = 'Soil water content';
  const SOIL_WATER_POTENTIAL = 'Soil water potential';
  const TEMPERATURE = 'Temperature';

  const statuses = [SOIL_WATER_CONTENT, SOIL_WATER_POTENTIAL, TEMPERATURE];

  const STATUS = 'STATUS';
  const filterRef = useRef({});

  const filter = {
    subject: t('Reading types'),
    filterKey: STATUS,
    options: statuses.map((status) => ({
      value: status.toLowerCase(),
      default: tasksFilter[STATUS][status.toLowerCase()]?.active ?? false,
      label: status,
    })),
  };

  const onSubmit = (data) => {
    console.log(data);
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
        tasksFilter={tasksFilter}
      />
    </>
  );
}
