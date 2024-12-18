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
import { getProgress } from '../util';
import useAnimalsExist from '../../Animals/Inventory/useAnimalsExist';
import { useNavigate } from 'react-router';

export default function TaskLocationsSwitch({ location }) {
  const isHarvestLocation = useIsTaskType('HARVEST_TASK');
  const isIrrigationLocation = useIsTaskType('IRRIGATION_TASK');
  const isTransplantLocation = useIsTaskType('TRANSPLANT_TASK');
  const isSoilAmendmentLocation = useIsTaskType('SOIL_AMENDMENT_TASK');
  const isAnimalLocation = useIsTaskType('MOVEMENT_TASK');
  const isCustomLocation = useIsTaskType('CUSTOM_TASK');

  if (isHarvestLocation) {
    return <TaskActiveAndPlannedCropLocations location={location} />;
  }

  if (isTransplantLocation) {
    return <TaskTransplantLocations location={location} />;
  }

  if (isIrrigationLocation) {
    return <TaskIrrigationLocations location={location} />;
  }

  if (isSoilAmendmentLocation) {
    return <TaskSoilAmendmentLocations location={location} />;
  }

  if (isAnimalLocation) {
    return <TaskAnimalLocations location={location} />;
  }

  if (isCustomLocation) {
    return <TaskCustomLocations location={location} />;
  }

  return <TaskAllLocations location={location} />;
}

function TaskActiveAndPlannedCropLocations({ location }) {
  let navigate = useNavigate();
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
    navigate('/add_task/task_crops', { state: location?.state });
  };

  return (
    <TaskLocations
      locations={activeAndPlannedLocations}
      isMulti={true}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

function TaskTransplantLocations({ location }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const onContinue = () => {
    navigate('/add_task/planting_method', { state: location.state });
  };

  return (
    <TaskLocations
      locations={cropLocations}
      isMulti={false}
      title={t('TASK.TRANSPLANT_LOCATIONS')}
      onContinue={onContinue}
      location={location}
    />
  );
}

function TaskIrrigationLocations({ location }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();
  const onContinue = () => {
    navigate('/add_task/task_crops', { state: location.state });
  };

  return (
    <TaskLocations
      locations={cropLocations}
      isMulti={false}
      title={t('TASK.IRRIGATION_LOCATION')}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

//This goes to all crop locations, multiSelect, not wildCrops with pins
function TaskSoilAmendmentLocations({ location }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const cropLocations = useSelector(cropLocationsSelector);
  const onContinue = () => {
    navigate('/add_task/task_crops', { state: location.state });
  };

  return (
    <TaskLocations
      locations={cropLocations}
      isMulti={true}
      title={t('TASK.SOIL_AMENDMENT_LOCATION')}
      onContinue={onContinue}
      location={location}
    />
  );
}

function TaskAnimalLocations({ location }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const animalLocations = useSelector(animalLocationsSelector);
  const onContinue = () => {
    navigate('/add_task/task_details', { state: location.state });
  };

  return (
    <TaskLocations
      locations={animalLocations}
      isMulti={false}
      title={t('TASK.ANIMAL_MOVING_TO_LOCATION')}
      onContinue={onContinue}
      location={location}
      isAnimalTask={true}
    />
  );
}

function TaskCustomLocations({ location }) {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const locations = useSelector(locationsSelector);
  const readOnlyPinCoordinates = useReadOnlyPinCoordinates();
  const activeAndCurrentManagementPlansByLocationIds =
    useActiveAndCurrentManagementPlanTilesByLocationIds(locations);
  const wildManagementPlanTiles = useCurrentWildManagementPlanTiles();
  const { animalsExistOnFarm } = useAnimalsExist();

  const onContinue = (formData) => {
    const hasLocationManagementPlans = formData.locations.some(
      ({ location_id }) => activeAndCurrentManagementPlansByLocationIds[location_id]?.length,
    );
    const hasWildManagementPlans = formData.show_wild_crop && wildManagementPlanTiles.length;
    const hasManagementPlans = hasLocationManagementPlans || hasWildManagementPlans;
    if (!hasManagementPlans) {
      dispatch(setManagementPlansData([]));
      if (animalsExistOnFarm) {
        return navigate('/add_task/task_animal_selection', { state: location?.state });
      }
      return navigate('/add_task/task_details', { state: location?.state });
    }
    navigate('/add_task/task_crops', { state: location?.state });
  };

  const progress = getProgress('CUSTOM_TASK', 'task_locations');

  return (
    <TaskLocations
      locations={locations}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
      optionalLocation
      progress={progress}
    />
  );
}

function TaskAllLocations({ location }) {
  let navigate = useNavigate();
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
      return navigate('/add_task/task_details', { state: location?.state });
    }
    navigate('/add_task/task_crops', { state: location?.state });
  };

  return (
    <TaskLocations
      locations={locations}
      onContinue={onContinue}
      readOnlyPinCoordinates={readOnlyPinCoordinates}
      location={location}
    />
  );
}

function TaskLocations({
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
  let navigate = useNavigate();
  const { grid_points } = useSelector(userFarmSelector);
  const { maxZoomRef, getMaxZoom, maxZoom } = useMaxZoom();
  const managementPlan = location?.state?.management_plan_id
    ? useSelector(managementPlanSelector(location.state.management_plan_id))
    : null;
  const onGoBack = () => {
    navigate(-1);
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
