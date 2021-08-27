import React from 'react';
import {
  hookFormPersistSelector,
  setManagementPlansData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useDispatch, useSelector } from 'react-redux';
import PureTaskLocations from '../../../components/Task/TaskLocations';
import { taskTypeIdNoCropsSelector } from '../../taskTypeSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { locationsSelector, cropLocationsSelector } from '../../locationSlice';
import { useActiveAndCurrentManagementPlansByLocationIds }from '../../AddTask/TaskCrops/useManagementPlanTilesByLocationIds';
import { taskTypeById } from '../../taskTypeSlice';
import { getDateUTC } from '../../../util/moment';

export default function TaskLocations({ history }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const persistedPath = ['/add_task/task_date', '/add_task/task_details', '/add_task/task_crops'];

  const onCancel = () => {
    history.push('/tasks');
  };

  const onContinue = () => {
    if (taskTypesBypassCrops.includes(persistedFormData.type)) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details');
    }
    history.push('/add_task/task_crops');
  };

  const onGoBack = () => {
    history.push('/add_task/task_date');
  };

  const HARVEST_TYPE = 'HARVEST';

  const { grid_points } = useSelector(userFarmSelector);
  const selectedTaskType = useSelector(taskTypeById(persistedFormData.type));
  const due_date = persistedFormData.due_date;
  const locations = useSelector(locationsSelector);
  const cropLocations = useSelector(cropLocationsSelector);
  const cropLocationsIds = cropLocations.map(({ location_id }) => ({ location_id }));
  const activeAndPlannedLocationsIds = Object.keys(useActiveAndCurrentManagementPlansByLocationIds(cropLocationsIds, getDateUTC(due_date).toDate().getTime()));
  const activeAndPlannedLocations = cropLocations.filter(({ location_id }) => activeAndPlannedLocationsIds.includes(location_id));


  return (
    <HookFormPersistProvider>
      <PureTaskLocations
        onCancel={onCancel}
        onContinue={onContinue}
        onGoBack={onGoBack}
        persistedPath={persistedPath}
        farmCenterCoordinate={grid_points}
        locations={selectedTaskType.task_translation_key === HARVEST_TYPE ? activeAndPlannedLocations : locations}
      />
    </HookFormPersistProvider>
  );
}