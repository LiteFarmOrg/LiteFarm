import { PureTaskTypeSelection } from '../../../components/Task/PureTaskTypeSelection/PureTaskTypeSelection';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getTaskTypes } from '../saga';
import { defaultTaskTypesSelector, userCreatedTaskTypesSelector } from '../../taskTypeSlice';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import useAnimalsExist from '../../Animals/Inventory/useAnimalsExist';
import { animalLocationsSelector } from '../../locationSlice';
import { soilSampleLocationsSelector } from '../../soilSampleLocationSlice';
import { hasAvailableProductsSelector } from '../../productSlice';
import { TASK_TYPES } from '../constants';

function TaskTypeSelection() {
  const location = useLocation();
  const history = useHistory();
  const navigate = useNavigate();
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

  useEffect(() => {
    dispatch(getTaskTypes());
  }, []);

  const onCustomTask = () => {
    history.push(customTaskPath, location?.state);
  };

  const onContinue = () => history.push(continuePath, location?.state);

  const handleGoBack = () => {
    navigate(-1);
  };

  const onError = () => {};

  const updatePlantTaskSpotlight = () => dispatch(setSpotlightToShown('planting_task'));

  const hasCurrentManagementPlans =
    useSelector(currentAndPlannedManagementPlansSelector)?.length > 0;

  const hasAnimalMovementLocations = useSelector(animalLocationsSelector)?.length > 0;
  const hasSoilSampleLocations = useSelector(soilSampleLocationsSelector)?.length > 0;
  const hasSoilAmendmentProducts = useSelector((state) =>
    hasAvailableProductsSelector(state, TASK_TYPES.SOIL_AMENDMENT),
  );

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
        />
      </HookFormPersistProvider>
    </>
  );
}

export default TaskTypeSelection;
