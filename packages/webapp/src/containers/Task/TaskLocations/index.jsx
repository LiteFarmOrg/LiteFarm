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
import {
  cropLocationEntitiesSelector,
  cropLocationsSelector,
  locationsSelector,
} from '../../locationSlice';
import { useActiveAndCurrentManagementPlanTilesByLocationIds } from '../TaskCrops/useManagementPlanTilesByLocationIds';
import { useIsTaskType } from '../useIsTaskType';
import { useTranslation } from 'react-i18next';
import { useReadOnlyPinCoordinates } from '../useReadOnlyPinCoordinates';
import { useMaxZoom } from '../../Map/useMaxZoom';
import { managementPlanSelector } from '../../managementPlanSlice';

export default function TaskLocationsSwitch({ history, match, location }) {
  const isHarvestLocation = useIsTaskType('HARVEST_TASK') ;
  const isIrrigationLocation = useIsTaskType('IRRIGATION_TASK');
  const isTransplantLocation = useIsTaskType('TRANSPLANT_TASK');
  
  if (isHarvestLocation || isIrrigationLocation) {
    return <TaskActiveAndPlannedCropLocations history={history} location={location} isMulti={isHarvestLocation}/>;
  } 
  
  if (isTransplantLocation) {
    return <TaskTransplantLocations history={history} location={location} />;
  }
  
  return <TaskAllLocations history={history} location={location} />;
}

function TaskActiveAndPlannedCropLocations({ history, location, isMulti }) {
  const cropLocations = useSelector(cropLocationsSelector);
  const cropLocationEntities = useSelector(cropLocationEntitiesSelector);
  const cropLocationsIds = cropLocations.map(({ location_id }) => ({ location_id }));
  const activeAndPlannedLocationsIds = Object.keys(
    useActiveAndCurrentManagementPlanTilesByLocationIds(cropLocationsIds),
  );
  const activeAndPlannedLocations = activeAndPlannedLocationsIds.map(
    (location_id) => cropLocationEntities[location_id],
  );
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();

  const onContinue = () => {
    history.push('/add_task/task_crops', location?.state);
  };

  const onGoBack = () => {
    history.back();
  };
  return (
    <TaskLocations
      locations={activeAndPlannedLocations}
      history={history}
      isMulti={isMulti}
      onContinue={onContinue}
      onGoBack={onGoBack}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

function TaskTransplantLocations({ history, location }) {
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const onContinue = () => {
    history.push('/add_task/planting_method', location.state);
  };

  const onGoBack = () => {
    history.back();
  };
  return (
    <TaskLocations
      locations={cropLocations}
      history={history}
      isMulti={false}
      title={t('TASK.TRANSPLANT_LOCATIONS')}
      onContinue={onContinue}
      onGoBack={onGoBack}
      location={location}
    />
  );
}

function TaskAllLocations({ history, location }) {
  const dispatch = useDispatch();
  const locations = useSelector(locationsSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();

  const onContinue = () => {
    if (
      taskTypesBypassCrops.includes(persistedFormData.task_type_id) &&
      !readOnlyPinCoordinates?.length
    ) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details', location?.state);
    }
    history.push('/add_task/task_crops', location?.state);
  };

  const onGoBack = () => {
    history.back();
  };
  return (
    <TaskLocations
      locations={locations}
      history={history}
      onGoBack={onGoBack}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

function TaskLocations({
  history,
  locations,
  isMulti,
  title,
  onContinue,
  onGoBack,
  readOnlyPinCoordinates,
  location,
}) {
  const { grid_points } = useSelector(userFarmSelector);
  const { maxZoomRef, getMaxZoom } = useMaxZoom();
  const managementPlan = location?.state?.management_plan_id
    ? useSelector(managementPlanSelector(location.state.management_plan_id))
    : null;
  return (
    <HookFormPersistProvider>
      <PureTaskLocations
        onContinue={onContinue}
        onGoBack={onGoBack}
        farmCenterCoordinate={grid_points}
        locations={locations}
        isMulti={isMulti}
        title={title}
        readOnlyPinCoordinates={readOnlyPinCoordinates}
        maxZoomRef={maxZoomRef}
        getMaxZoom={getMaxZoom}
        defaultLocation={location?.state?.location ?? null}
        targetsWildCrop={managementPlan?.crop_management_plan?.is_wild ?? false}
      />
    </HookFormPersistProvider>
  );
}
