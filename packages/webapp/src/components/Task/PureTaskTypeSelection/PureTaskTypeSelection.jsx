import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import styles from './styles.module.scss';
import CollectSoilSample from '../../../assets/images/task/CollectSoilSample.svg?react';
import Transport from '../../../assets/images/task/Transport.svg?react';
import Clean from '../../../assets/images/task/Clean.svg?react';
import Fertilize from '../../../assets/images/task/Fertilize.svg?react';
import FieldWork from '../../../assets/images/task/FieldWork.svg?react';
import Harvest from '../../../assets/images/task/Harvest.svg?react';
import Irrigation from '../../../assets/images/task/Irrigation.svg?react';
import Maintenance from '../../../assets/images/task/Maintenance.svg?react';
import PestControl from '../../../assets/images/task/PestControl.svg?react';
import Plant from '../../../assets/images/task/Plant.svg?react';
import RecordSoilSample from '../../../assets/images/task/RecordSoilSample.svg?react';
import Sales from '../../../assets/images/task/Sales.svg?react';
import Scout from '../../../assets/images/task/Scout.svg?react';
import SocialEvent from '../../../assets/images/task/SocialEvent.svg?react';
import SoilAmendment from '../../../assets/images/task/SoilAmendment.svg?react';
import Transplant from '../../../assets/images/task/Transplant.svg?react';
import WashAndPack from '../../../assets/images/task/WashAndPack.svg?react';
import Movement from '../../../assets/images/task/Movement.svg?react';
import CustomTask from '../../../assets/images/task/Custom.svg?react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { PlantingTaskModal } from '../../Modals/PlantingTaskModal';
import { isTaskType } from '../../../containers/Task/useIsTaskType';
import { NoCropManagementPlanModal } from '../../Modals/NoCropManagementPlanModal';
import { getSupportedTaskTypesSet } from '../getSupportedTaskTypesSet';
import { ANIMAL_TASKS } from '../../../containers/Task/constants';
import { CantFindCustomType } from '../../Finances/PureFinanceTypeSelection/CantFindCustomType';
import { NoAnimalLocationsModal } from '../../Modals/NoAnimalLocationsModal';
import { NoSoilSampleLocationsModal } from '../../Modals/NoSoilSampleLocationsModal';
import { NoSoilAmendmentProductsModal } from '../../Modals/NoSoilAmendmentProductsModal';
import { NoIrrigationLocationsModal } from '../../Modals/NoIrrigationLocationsModal';
import { PRODUCT_INVENTORY_URL } from '../../../util/siteMapConstants';
import navStyles from '@navStyles';

const icons = {
  SOIL_AMENDMENT_TASK: <SoilAmendment />,
  FIELD_WORK_TASK: <FieldWork />,
  HARVEST_TASK: <Harvest />,
  IRRIGATION_TASK: <Irrigation />,
  PEST_CONTROL_TASK: <PestControl />,
  PLANT_TASK: <Plant />,
  SOIL_TASK: <RecordSoilSample />,
  SALE_TASK: <Sales />,
  SCOUTING_TASK: <Scout />,
  SOCIAL_TASK: <SocialEvent />,
  TRANSPORT_TASK: <Transport />,
  WASH_AND_PACK_TASK: <WashAndPack />,
  CLEANING_TASK: <Clean />,
  TRANSPLANT_TASK: <Transplant />,
  FERTILIZE_TASK: <Fertilize />,
  SOIL_SAMPLE_TASK: <CollectSoilSample />,
  MAINTENANCE_TASK: <Maintenance />,
  MOVEMENT_TASK: <Movement />,
};

export const PureTaskTypeSelection = ({
  onCustomTask,
  handleGoBack,
  history,
  location,
  persistedFormData,
  useHookFormPersist,
  onContinue,
  taskTypes,
  customTasks,
  isAdmin,
  shouldShowPlantTaskSpotLight,
  updatePlantTaskSpotlight,
  hasCurrentManagementPlans,
  hasAnimalMovementLocations,
  hasAnimals,
  hasSoilSampleLocations,
  hasSoilAmendmentProducts,
  hasIrrigationLocations,
  isOffline,
}) => {
  const { t } = useTranslation();
  const { watch, getValues, register, setValue } = useForm({
    defaultValues: persistedFormData,
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const TASK_TYPE_ID = 'task_type_id';
  register(TASK_TYPE_ID);
  const selected_task_type = watch(TASK_TYPE_ID);

  const isMakingCropTask = !!location?.state?.management_plan_id;
  const isMakingAnimalTask = !!location?.state?.animal_ids;

  const onSelectTask = (task_type_id) => {
    setValue(TASK_TYPE_ID, task_type_id);
    onContinue();
  };

  const [errorModal, setErrorModal] = useState('');

  const goToCatalogue = () => history.push('/crop_catalogue');
  const goToMap = () => history.push('/map');
  const goToInventory = () => history.push(PRODUCT_INVENTORY_URL);
  const onPlantTaskTypeClick = () => {
    if (shouldShowPlantTaskSpotLight) {
      setErrorModal('PLANT_TASK');
    } else {
      goToCatalogue();
    }
  };

  const onTileClick = (taskType) => {
    if (isTaskType(taskType, 'PLANT_TASK')) {
      return onPlantTaskTypeClick(taskType.task_type_id);
    }
    if (
      ((isTaskType(taskType, 'TRANSPLANT_TASK') || isTaskType(taskType, 'HARVEST_TASK')) &&
        !hasCurrentManagementPlans) ||
      (isTaskType(taskType, 'MOVEMENT_TASK') && !hasAnimalMovementLocations) ||
      (isTaskType(taskType, 'SOIL_SAMPLE_TASK') && !hasSoilSampleLocations) ||
      (isTaskType(taskType, 'SOIL_AMENDMENT_TASK') && !hasSoilAmendmentProducts) ||
      (isTaskType(taskType, 'IRRIGATION_TASK') && !hasIrrigationLocations)
    ) {
      return setErrorModal(taskType.task_translation_key);
    }
    return onSelectTask(taskType.task_type_id);
  };

  const shouldDisplayTaskType = (taskType) => {
    const supportedTaskTypes = getSupportedTaskTypesSet(isAdmin, hasAnimals);
    const { farm_id, task_translation_key } = taskType;

    if (isOffline && isTaskType(taskType, 'PLANT_TASK')) {
      return false;
    }

    if (farm_id === null && supportedTaskTypes.has(task_translation_key)) {
      // If trying to make a task through the crop management plan 'Add Task' link -- exclude animal tasks from selection for now
      if (isMakingCropTask) {
        return !ANIMAL_TASKS.includes(task_translation_key);
      }
      // If trying to make a task through the animal inventory 'Create a task' action -- only include animal tasks in selection
      if (isMakingAnimalTask) {
        return ANIMAL_TASKS.includes(task_translation_key);
      }
      return true;
    }
    return false;
  };

  return (
    <>
      <Form>
        <MultiStepPageTitle
          style={{ marginBottom: '20px' }}
          onGoBack={handleGoBack}
          onCancel={historyCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          value={14}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.SELECT_TASK_TYPE')}</Main>

        {isOffline && (
          <div className={styles.offlineNotice}>
            <h3>{t('ADD_TASK.OFFLINE_NOTICE.YOURE_OFFLINE')}</h3>
            <p>{t('ADD_TASK.OFFLINE_NOTICE.CANNOT_ADD_NEW')}</p>
          </div>
        )}

        <div style={{ paddingBottom: '20px' }} className={styles.matrixContainer}>
          {taskTypes
            ?.filter(shouldDisplayTaskType)
            .sort((firstTaskType, secondTaskType) =>
              t(`task:${firstTaskType.task_translation_key}`).localeCompare(
                t(`task:${secondTaskType.task_translation_key}`),
              ),
            )
            .map((taskType) => {
              const { task_translation_key, task_type_id } = taskType;
              return (
                <div
                  data-cy="task-selection"
                  onClick={() => {
                    onTileClick(taskType);
                  }}
                  key={task_type_id}
                  className={clsx(
                    styles.typeContainer,
                    selected_task_type === task_type_id && styles.typeContainerSelected,
                  )}
                >
                  {icons[task_translation_key]}
                  <div className={styles.taskTypeLabelContainer}>
                    {t(`task:${task_translation_key}`)}
                  </div>
                </div>
              );
            })}
          {customTasks
            ?.sort((firstTaskType, secondTaskType) =>
              firstTaskType.task_name.localeCompare(secondTaskType.task_name),
            )
            .map(({ task_type_id, task_name }) => {
              return (
                <div
                  onClick={() => {
                    onSelectTask(task_type_id);
                  }}
                  key={task_type_id}
                >
                  <div
                    className={clsx(
                      styles.typeContainer,
                      selected_task_type === task_type_id && styles.typeContainerSelected,
                    )}
                  >
                    <CustomTask />
                    <div className={styles.taskTypeLabelContainer}>{task_name}</div>
                  </div>
                </div>
              );
            })}
        </div>
        {isAdmin && (
          <div className={clsx(styles.cantFindCustomTypeWrapper, navStyles.hideWhenOffline)}>
            <CantFindCustomType
              customTypeMessages={{
                info: t('ADD_TASK.CANT_FIND_INFO_TASK'),
                manage: t('ADD_TASK.MANAGE_CUSTOM_TASKS'),
              }}
              onGoToManageCustomType={onCustomTask}
            />
          </div>
        )}
      </Form>
      {errorModal === 'PLANT_TASK' && shouldShowPlantTaskSpotLight && (
        <PlantingTaskModal
          goToCatalogue={goToCatalogue}
          dismissModal={() => setErrorModal('')}
          updatePlantTaskSpotlight={updatePlantTaskSpotlight}
        />
      )}
      {['TRANSPLANT_TASK', 'HARVEST_TASK'].includes(errorModal) && (
        <NoCropManagementPlanModal
          dismissModal={() => setErrorModal('')}
          goToCatalogue={goToCatalogue}
        />
      )}
      {errorModal === 'MOVEMENT_TASK' && (
        <NoAnimalLocationsModal dismissModal={() => setErrorModal('')} goToMap={goToMap} />
      )}
      {errorModal === 'SOIL_SAMPLE_TASK' && (
        <NoSoilSampleLocationsModal
          dismissModal={() => setErrorModal('')}
          goToMap={goToMap}
          isAdmin={isAdmin}
        />
      )}
      {errorModal === 'SOIL_AMENDMENT_TASK' && (
        <NoSoilAmendmentProductsModal
          dismissModal={() => setErrorModal('')}
          goToInventory={goToInventory}
        />
      )}
      {errorModal === 'IRRIGATION_TASK' && (
        <NoIrrigationLocationsModal
          dismissModal={() => setErrorModal('')}
          goToMap={goToMap}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
};
