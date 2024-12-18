import PureTaskCrops from '../../../components/Task/PureTaskCrops';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import {
  useActiveAndCurrentManagementPlanTilesByLocationIds,
  useCurrentWildManagementPlanTiles,
} from './useManagementPlanTilesByLocationIds';
import { cropLocationsSelector } from '../../locationSlice';
import { useIsTaskType } from '../useIsTaskType';
import { getProgress } from '../util';
import useAnimalsExist from '../../Animals/Inventory/useAnimalsExist';
import { useNavigate } from 'react-router';

export default function ManagementPlanSelector({ location }) {
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const isCustomTask = useIsTaskType('CUSTOM_TASK');
  if (isTransplantTask) return <TransplantManagementPlansSelector location={location} />;
  if (isCustomTask) return <CustomTaskManagementPlansSelector location={location} />;
  return <TaskCrops location={location} />;
}

function TransplantManagementPlansSelector({ location }) {
  const locations = useSelector(cropLocationsSelector);
  const onContinuePath = '/add_task/task_locations';
  const goBackPath = '/add_task/task_date';
  return (
    <TaskCrops
      locations={locations}
      onContinuePath={onContinuePath}
      goBackPath={goBackPath}
      isMulti={false}
      location={location}
    />
  );
}

function CustomTaskManagementPlansSelector({ location }) {
  const { animalsExistOnFarm } = useAnimalsExist();
  const onContinuePath = animalsExistOnFarm ? '/add_task/task_animal_selection' : undefined;
  const progress = getProgress('CUSTOM_TASK', 'task_crops');

  return <TaskCrops onContinuePath={onContinuePath} location={location} progress={progress} />;
}

function TaskCrops({
  goBackPath = '/add_task/task_locations',
  onContinuePath = '/add_task/task_details',
  locations,
  location,
  progress,
}) {
  let navigate = useNavigate();
  const persistedPaths = [goBackPath, onContinuePath];
  const handleGoBack = () => {
    navigate(-1);
  };
  const onContinue = () => {
    navigate(onContinuePath, { state: location?.state });
  };
  const onError = () => {};
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const isHarvestTask = useIsTaskType('HARVEST_TASK');
  const showWildCrops = isTransplantTask || persistedFormData.show_wild_crop;
  const wildManagementPlanTiles = useCurrentWildManagementPlanTiles();
  const activeAndCurrentManagementPlansByLocationIds =
    useActiveAndCurrentManagementPlanTilesByLocationIds(
      locations || persistedFormData.locations,
      showWildCrops,
    );

  const isRequired =
    isHarvestTask || isTransplantTask || (showWildCrops && !persistedFormData.locations?.length);
  return (
    <HookFormPersistProvider>
      <PureTaskCrops
        handleGoBack={handleGoBack}
        onError={onError}
        persistedPaths={persistedPaths}
        managementPlansByLocationIds={activeAndCurrentManagementPlansByLocationIds}
        onContinue={onContinue}
        isMulti={!isTransplantTask}
        isRequired={isRequired}
        wildManagementPlanTiles={showWildCrops ? wildManagementPlanTiles : undefined}
        defaultManagementPlanId={location?.state?.management_plan_id ?? null}
        progress={progress}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
