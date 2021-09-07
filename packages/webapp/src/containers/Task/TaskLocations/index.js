import React from 'react';
import {
  hookFormPersistSelector,
  setManagementPlansData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';
import { taskTypeById, taskTypeIdNoCropsSelector } from '../../taskTypeSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import {
  cropLocationEntitiesSelector,
  cropLocationsSelector,
  locationsSelector,
} from '../../locationSlice';
import { useActiveAndCurrentManagementPlanTilesByLocationIds } from '../TaskCrops/useManagementPlanTilesByLocationIds';

export default function TaskLocationsSwitch({ history, match }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.task_type_id));
  const isCropLocation = selectedTaskType.task_translation_key === 'HARVEST_TASK';
  return isCropLocation ? (
    <TaskCropLocations history={history} persistedFormData={persistedFormData} />
  ) : (
    <TaskAllLocations history={history} />
  );
}

function TaskCropLocations({ history, persistedFormData }) {
  const cropLocations = useSelector(cropLocationsSelector);
  const cropLocationEntities = useSelector(cropLocationEntitiesSelector);
  const cropLocationsIds = cropLocations.map(({ location_id }) => ({ location_id }));
  const activeAndPlannedLocationsIds = Object.keys(
    useActiveAndCurrentManagementPlanTilesByLocationIds(cropLocationsIds),
  );
  const activeAndPlannedLocations = activeAndPlannedLocationsIds.map(
    (location_id) => cropLocationEntities[location_id],
  );
  return <TaskLocations locations={activeAndPlannedLocations} history={history} />;
}

function TaskAllLocations({ history }) {
  const locations = useSelector(locationsSelector);
  return <TaskLocations locations={locations} history={history} />;
}

function TaskLocations({ history, locations }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const persistedPath = ['/add_task/task_date', '/add_task/task_details', '/add_task/task_crops'];

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    if (taskTypesBypassCrops.includes(persistedFormData.task_type_id)) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details');
    }
    history.push('/add_task/task_crops');
  };

  const onGoBack = () => {
    history.push('/add_task/task_date');
  };

  const { grid_points } = useSelector(userFarmSelector);

  return (
    <HookFormPersistProvider>
      <PureTaskLocations
        onCancel={onCancel}
        onContinue={onContinue}
        onGoBack={onGoBack}
        persistedPath={persistedPath}
        farmCenterCoordinate={grid_points}
        locations={locations}
      />
    </HookFormPersistProvider>
  );
}
