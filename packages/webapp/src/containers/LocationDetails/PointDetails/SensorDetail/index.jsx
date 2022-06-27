import PureSensorDetail from '../../../../components/LocationDetailLayout/Sensor/SensorDetail/index';
import { managementPlanSelector } from '../../../managementPlanSlice';
import { measurementSelector } from '../../../userFarmSlice';
import { tasksFilterSelector } from '../../../filterSlice';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

export default function Detail({ history, user, match }) {
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
    subject: t(''),
    filterKey: STATUS,
    options: statuses.map((status) => ({
      value: status.toLowerCase(),
      default: tasksFilter[STATUS][status.toLowerCase()]?.active ?? true,
      label: status,
    })),
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <PureSensorDetail
      history={history}
      user={user}
      match={match}
      system={system}
      filter={filter}
      filterRef={filterRef}
      tasksFilter={tasksFilter}
    />
  );
}
