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
  animalLocationsSelector,
  cropLocationEntitiesSelector,
  cropLocationsSelector,
  locationsSelector,
} from '../../locationSlice';
import {
  useActiveAndCurrentManagementPlanTilesByLocationIds,
  useCurrentWildManagementPlanTiles,
} from '../TaskCrops/useManagementPlanTilesByLocationIds';
import { useIsTaskType } from '../useIsTaskType';
import { useTranslation } from 'react-i18next';
import { useReadOnlyPinCoordinates } from '../useReadOnlyPinCoordinates';
import { useMaxZoom } from '../../Map/useMaxZoom';
import { managementPlanSelector } from '../../managementPlanSlice';
import useAnimalInventory from '../../Animals/Inventory/useAnimalInventory';
import { getProgress } from '../util';

export default function TaskLocationsSwitch({ history, match, location }) {
  const isHarvestLocation = useIsTaskType('HARVEST_TASK');
  const isIrrigationLocation = useIsTaskType('IRRIGATION_TASK');
  const isTransplantLocation = useIsTaskType('TRANSPLANT_TASK');
  const isSoilAmendmentLocation = useIsTaskType('SOIL_AMENDMENT_TASK');
  const isAnimalLocation = useIsTaskType('MOVEMENT_TASK');
  const isCustomLocation = useIsTaskType('CUSTOM_TASK');

  if (isHarvestLocation) {
    return <TaskActiveAndPlannedCropLocations history={history} location={location} />;
  }

  if (isTransplantLocation) {
    return <TaskTransplantLocations history={history} location={location} />;
  }

  if (isIrrigationLocation) {
    return <TaskIrrigationLocations history={history} location={location} />;
  }

  if (isSoilAmendmentLocation) {
    return <TaskSoilAmendmentLocations history={history} location={location} />;
  }

  if (isAnimalLocation) {
    return <TaskAnimalLocations history={history} location={location} />;
  }

  if (isCustomLocation) {
    return <TaskCustomLocations history={history} location={location} />;
  }

  return <TaskAllLocations history={history} location={location} />;
}

function TaskActiveAndPlannedCropLocations({ history, location }) {
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

  return (
    <TaskLocations
      locations={activeAndPlannedLocations}
      history={history}
      isMulti={true}
      onContinue={onContinue}
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

  return (
    <TaskLocations
      locations={cropLocations}
      history={history}
      isMulti={false}
      title={t('TASK.TRANSPLANT_LOCATIONS')}
      onContinue={onContinue}
      location={location}
    />
  );
}

function TaskIrrigationLocations({ history, location }) {
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();
  const onContinue = () => {
    history.push('/add_task/task_crops', location.state);
  };

  return (
    <TaskLocations
      locations={cropLocations}
      history={history}
      isMulti={false}
      title={t('TASK.IRRIGATION_LOCATION')}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

//This goes to all crop locations, multiSelect, not wildCrops with pins
function TaskSoilAmendmentLocations({ history, location }) {
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const onContinue = () => {
    history.push('/add_task/task_crops', location.state);
  };

  return (
    <TaskLocations
      locations={cropLocations}
      history={history}
      isMulti={true}
      title={t('TASK.SOIL_AMENDMENT_LOCATION')}
      onContinue={onContinue}
      location={location}
    />
  );
}

function TaskAnimalLocations({ history, location }) {
  const { t } = useTranslation();
  const animalLocations = useSelector(animalLocationsSelector);
  const onContinue = () => {
    history.push('/add_task/task_details', location.state);
  };

  return (
    <TaskLocations
      locations={animalLocations}
      history={history}
      isMulti={false}
      title={t('TASK.ANIMAL_MOVING_TO_LOCATION')}
      onContinue={onContinue}
      location={location}
      isAnimalTask={true}
    />
  );
}

function TaskCustomLocations({ history, location }) {
  const dispatch = useDispatch();
  const locations = useSelector(locationsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();
  const activeAndCurrentManagementPlansByLocationIds =
    useActiveAndCurrentManagementPlanTilesByLocationIds(locations);
  const wildManagementPlanTiles = useCurrentWildManagementPlanTiles();
  const { animalsExistOnFarm } = useAnimalInventory();

  const onContinue = (formData) => {
    const hasLocationManagementPlans = formData.locations.some(
      ({ location_id }) => activeAndCurrentManagementPlansByLocationIds[location_id]?.length,
    );
    const hasWildManagementPlans = formData.show_wild_crop && wildManagementPlanTiles.length;
    const hasManagementPlans = hasLocationManagementPlans || hasWildManagementPlans;
    if (!readOnlyPinCoordinates?.length || !hasManagementPlans) {
      dispatch(setManagementPlansData([]));
      if (animalsExistOnFarm) {
        return history.push('/add_task/task_animal_selection', location?.state);
      }
      return history.push('/add_task/task_details', location?.state);
    }
    history.push('/add_task/task_crops', location?.state);
  };

  const progress = getProgress('CUSTOM_TASK', 'task_locations');

  return (
    <TaskLocations
      locations={locations}
      history={history}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
      optionalLocation
      progress={progress}
    />
  );
}

function TaskAllLocations({ history, location }) {
  const dispatch = useDispatch();
  const locations = useSelector(locationsSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();
  const activeAndCurrentManagementPlansByLocationIds =
    useActiveAndCurrentManagementPlanTilesByLocationIds(locations);
  const wildManagementPlanTiles = useCurrentWildManagementPlanTiles();

  const onContinue = (formData) => {
    const hasLocationManagementPlans = formData.locations.some(
      ({ location_id }) => activeAndCurrentManagementPlansByLocationIds[location_id]?.length,
    );
    const hasWildManagementPlans = formData.show_wild_crop && wildManagementPlanTiles.length;
    const hasManagementPlans = hasLocationManagementPlans || hasWildManagementPlans;
    if (
      (taskTypesBypassCrops.includes(persistedFormData.task_type_id) &&
        !readOnlyPinCoordinates?.length) ||
      !hasManagementPlans
    ) {
      dispatch(setManagementPlansData([]));
      return history.push('/add_task/task_details', location?.state);
    }
    history.push('/add_task/task_crops', location?.state);
  };

  return (
    <TaskLocations
      locations={locations}
      history={history}
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
  readOnlyPinCoordinates,
  location,
  isAnimalTask = false,
  optionalLocation,
  progress,
}) {
  const { grid_points } = useSelector(userFarmSelector);
  const { maxZoomRef, getMaxZoom, maxZoom } = useMaxZoom();
  const managementPlan = location?.state?.management_plan_id
    ? useSelector(managementPlanSelector(location.state.management_plan_id))
    : null;
  const onGoBack = () => {
    history.back();
  };

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
        maxZoom={maxZoom}
        defaultLocation={location?.state?.location ?? null}
        targetsWildCrop={managementPlan?.crop_management_plan?.is_wild ?? false}
        isAnimalTask={isAnimalTask}
        optionalLocation={optionalLocation}
        progress={progress}
      />
    </HookFormPersistProvider>
  );
}
