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

export default function ManagementPlanSelector({ history, location }) {
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const isCustomTask = useIsTaskType('CUSTOM_TASK');
  if (isTransplantTask)
    return <TransplantManagementPlansSelector history={history} location={location} />;
  if (isCustomTask)
    return <CustomTaskManagementPlansSelector history={history} location={location} />;
  return <TaskCrops history={history} location={location} />;
}

function TransplantManagementPlansSelector({ history, location }) {
  const locations = useSelector(cropLocationsSelector);
  const onContinuePath = '/add_task/task_locations';
  const goBackPath = '/add_task/task_date';
  return (
    <TaskCrops
      locations={locations}
      onContinuePath={onContinuePath}
      goBackPath={goBackPath}
      history={history}
      isMulti={false}
      location={location}
    />
  );
}

function CustomTaskManagementPlansSelector({ history, location }) {
  const { animalsExistOnFarm } = useAnimalsExist();
  const onContinuePath = animalsExistOnFarm ? '/add_task/task_animal_selection' : undefined;
  const progress = getProgress('CUSTOM_TASK', 'task_crops');

  return (
    <TaskCrops
      onContinuePath={onContinuePath}
      history={history}
      location={location}
      progress={progress}
    />
  );
}

function TaskCrops({
  history,
  goBackPath = '/add_task/task_locations',
  onContinuePath = '/add_task/task_details',
  locations,
  location,
  progress,
}) {
  const persistedPaths = [goBackPath, onContinuePath];
  const handleGoBack = () => {
    history.back();
  };
  const onContinue = () => {
    history.push(onContinuePath, location?.state);
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
        history={history}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
