import PureTaskDetails from '../../../components/Task/PureTaskDetails';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../saga';
import { productsSelector } from '../../productSlice';
import { taskTypeSelector } from '../../taskTypeSlice';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import {
  useManagementPlanTilesByLocationIds,
  useWildManagementPlanTiles,
} from '../TaskCrops/useManagementPlanTilesByLocationIds';
//import { useIsTaskType } from '../useIsTaskType';

function TaskDetails({ history, match, location }) {
  const continuePath = '/add_task/task_assignment';
  const goBackPath = '/add_task/task_locations';

  const dispatch = useDispatch();
  const {
    country_id,
    units: { measurement: system },
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const products = useSelector(productsSelector);
  //const taskTypesBypassCrops = useSelector(taskTypeIdNoCropsSelector);
  const selectedTaskType = useSelector(taskTypeSelector(persistedFormData.task_type_id));
  const managementPlanIds = persistedFormData.managementPlans?.map(
    ({ management_plan_id }) => management_plan_id,
  );
  const managementPlanByLocations = useManagementPlanTilesByLocationIds(
    persistedFormData.locations,
    managementPlanIds,
  );
  const wildManagementPlanTiles = useWildManagementPlanTiles(persistedFormData.managementPlans);
  const showWildCrops = persistedFormData.show_wild_crop;

  const persistedPaths = [goBackPath, continuePath, '/add_task/task_crops'];

  //const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');
  const handleGoBack = () => {
    history.back();
  };

  const onSubmit = () => {
    history.push('/add_task/task_assignment', location?.state);
  };

  const onError = () => {};

  useEffect(() => {
    dispatch(getProducts());
  }, []);

  return (
    <HookFormPersistProvider>
      <PureTaskDetails
        handleGoBack={handleGoBack}
        onError={onError}
        onSubmit={onSubmit}
        persistedPaths={persistedPaths}
        selectedTaskType={selectedTaskType}
        system={system}
        products={products}
        farm={{ farm_id, country_id, interested }}
        managementPlanByLocations={managementPlanByLocations}
        wildManagementPlanTiles={showWildCrops && wildManagementPlanTiles}
        locations={persistedFormData.locations}
      />
    </HookFormPersistProvider>
  );
}

export default TaskDetails;
