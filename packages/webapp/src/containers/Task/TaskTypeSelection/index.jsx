import { PureTaskTypeSelection } from '../../../components/Task/PureTaskTypeSelection/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { getTaskTypes } from '../saga';
import { defaultTaskTypesSelector, userCreatedTaskTypesSelector } from '../../taskTypeSlice';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import useAnimalsExist from '../../Animals/Inventory/useAnimalsExist';
import { hasAvailableProductsSelector } from '../../productSlice';
import { TASK_TYPES } from '../constants';
import { useIsOffline } from '../../hooks/useOfflineDetector/useIsOffline';
import useCropLocations from '../../../hooks/location/useCropLocations';
import useAnimalLocations from '../../../hooks/location/useAnimalLocations';
import { InternalMapLocationType } from '../../../store/api/types';
import useLocations from '../../../hooks/location/useLocations';

function TaskTypeSelection() {
  const location = useLocation();
  const history = useHistory();
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const taskTypes = useSelector(defaultTaskTypesSelector);
  const customTasks = useSelector(userCreatedTaskTypesSelector);
  const continuePath = '/add_task/task_date';
  const customTaskPath = '/add_task/manage_custom_tasks';
  const persistedPaths = [continuePath, customTaskPath];
  const { planting_task } = useSelector(showedSpotlightSelector);
  const isAdmin = useSelector(isAdminSelector);
  const { animalsExistOnFarm } = useAnimalsExist();
  const isOffline = useIsOffline();

  useEffect(() => {
    dispatch(getTaskTypes());
  }, []);

  const onCustomTask = () => {
    history.push(customTaskPath, location?.state);
  };

  const onContinue = () => history.push(continuePath, location?.state);

  const handleGoBack = () => {
    history.back();
  };

  const onError = () => {};

  const updatePlantTaskSpotlight = () => dispatch(setSpotlightToShown('planting_task'));

  const hasCurrentManagementPlans =
    useSelector(currentAndPlannedManagementPlansSelector)?.length > 0;
  const { locations: animalLocations } = useAnimalLocations();
  const hasAnimalMovementLocations = animalLocations?.length > 0;
  const { locations: soilSampleLocations } = useLocations({
    filterBy: InternalMapLocationType.SOIL_SAMPLE_LOCATION,
  });
  const hasSoilSampleLocations = soilSampleLocations?.length > 0;
  const hasSoilAmendmentProducts = useSelector((state) =>
    hasAvailableProductsSelector(state, TASK_TYPES.SOIL_AMENDMENT),
  );
  const { locations: cropLocations } = useCropLocations();
  const hasIrrigationLocations = cropLocations?.length > 0;

  return (
    <>
      <HookFormPersistProvider>
        <PureTaskTypeSelection
          history={history}
          location={location}
          onCustomTask={onCustomTask}
          handleGoBack={handleGoBack}
          persistedPaths={persistedPaths}
          onContinue={onContinue}
          onError={onError}
          taskTypes={taskTypes}
          customTasks={customTasks}
          isAdmin={isAdmin}
          shouldShowPlantTaskSpotLight={!planting_task}
          updatePlantTaskSpotlight={updatePlantTaskSpotlight}
          hasCurrentManagementPlans={hasCurrentManagementPlans}
          hasAnimalMovementLocations={hasAnimalMovementLocations}
          hasAnimals={animalsExistOnFarm}
          hasSoilSampleLocations={hasSoilSampleLocations}
          hasSoilAmendmentProducts={hasSoilAmendmentProducts}
          hasIrrigationLocations={hasIrrigationLocations}
          isOffline={isOffline}
        />
      </HookFormPersistProvider>
    </>
  );
}

export default TaskTypeSelection;
