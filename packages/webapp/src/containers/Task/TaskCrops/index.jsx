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

export default function ManagementPlanSelector({ history, match, location }) {
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const isCustomTask = useIsTaskType('CUSTOM_TASK');
  if (isTransplantTask)
    return (
      <TransplantManagementPlansSelector history={history} match={match} location={location} />
    );
  if (isCustomTask)
    return (
      <CustomTaskManagementPlansSelector history={history} match={match} location={location} />
    );
  return <TaskCrops history={history} match={match} location={location} />;
}

function TransplantManagementPlansSelector({ history, match, location }) {
  const locations = useSelector(cropLocationsSelector);
  const onContinuePath = '/add_task/task_locations';
  const goBackPath = '/add_task/task_date';
  return (
    <TaskCrops
      locations={locations}
      onContinuePath={onContinuePath}
      goBackPath={goBackPath}
      history={history}
      match={match}
      isMulti={false}
      location={location}
    />
  );
}

function CustomTaskManagementPlansSelector({ history, match, location }) {
  const onContinuePath = '/add_task/task_animal_selection';
  return (
    <TaskCrops
      onContinuePath={onContinuePath}
      history={history}
      match={match}
      location={location}
    />
  );
}

function TaskCrops({
  history,
  match,
  goBackPath = '/add_task/task_locations',
  onContinuePath = '/add_task/task_details',
  locations,
  location,
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
        history={history}
        location={location}
      />
    </HookFormPersistProvider>
  );
}
