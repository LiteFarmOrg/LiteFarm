import React, { useState } from 'react';
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
import CustomTask from '../../../assets/images/task/Custom.svg?react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import Button from '../../Form/Button';
import { PlantingTaskModal } from '../../Modals/PlantingTaskModal';
import { isTaskType } from '../../../containers/Task/useIsTaskType';
import { NoCropManagementPlanModal } from '../../Modals/NoCropManagementPlanModal';
import { getSupportedTaskTypesSet } from '../getSupportedTaskTypesSet';

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
  COLLECT_SOIL_SAMPLE_TASK: <CollectSoilSample />,
  MAINTENANCE_TASK: <Maintenance />,
};

export const PureTaskTypeSelection = ({
  onCustomTask,
  handleGoBack,
  history,

  persistedFormData,
  useHookFormPersist,
  onContinue,
  onError,
  taskTypes,
  customTasks,
  isAdmin,
  shouldShowPlantTaskSpotLight,
  updatePlantTaskSpotlight,
  hasCurrentManagementPlans,
}) => {
  const { t } = useTranslation();
  const { watch, getValues, register, setValue } = useForm({
    defaultValues: persistedFormData,
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const TASK_TYPE_ID = 'task_type_id';
  register(TASK_TYPE_ID);
  const selected_task_type = watch(TASK_TYPE_ID);

  const onSelectTask = (task_type_id) => {
    setValue(TASK_TYPE_ID, task_type_id);
    onContinue();
  };

  const [showPlantTaskModal, setShowPlantTaskModal] = useState();
  const goToCatalogue = () => history.push('/crop_catalogue');
  const onPlantTaskTypeClick = () => {
    if (shouldShowPlantTaskSpotLight) {
      setShowPlantTaskModal(true);
    } else {
      goToCatalogue();
    }
  };
  const [showNoManagementPlanModal, setShowNoManagementPlanModal] = useState();
  const onHarvestTransplantTaskClick = (task_type_id) => {
    hasCurrentManagementPlans ? onSelectTask(task_type_id) : setShowNoManagementPlanModal(true);
  };

  const onTileClick = (taskType) => {
    if (isTaskType(taskType, 'PLANT_TASK')) return onPlantTaskTypeClick(taskType.task_type_id);
    if (isTaskType(taskType, 'TRANSPLANT_TASK') || isTaskType(taskType, 'HARVEST_TASK')) {
      return onHarvestTransplantTaskClick(taskType.task_type_id);
    }
    return onSelectTask(taskType.task_type_id);
  };
  return (
    <>
      <Form>
        <MultiStepPageTitle
          style={{ marginBottom: '20px' }}
          onGoBack={handleGoBack}
          onCancel={historyCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={14}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.SELECT_TASK_TYPE')}</Main>

        <div style={{ paddingBottom: '20px' }} className={styles.matrixContainer}>
          {taskTypes
            ?.filter(({ farm_id, task_translation_key }) => {
              const supportedTaskTypes = getSupportedTaskTypesSet(isAdmin);
              return farm_id === null && supportedTaskTypes.has(task_translation_key);
            })
            .sort((firstTaskType, secondTaskType) =>
              t(`task:${firstTaskType.task_translation_key}`).localeCompare(
                t(`task:${secondTaskType.task_translation_key}`),
              ),
            )
            .map((taskType) => {
              const { task_translation_key, task_type_id, farm_id } = taskType;
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
            .map(({ task_translation_key, task_type_id, task_name }) => {
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
          <Button color={'success'} onClick={onCustomTask}>
            {t('ADD_TASK.MANAGE_CUSTOM_TASKS')}
          </Button>
        )}
      </Form>
      {showPlantTaskModal && shouldShowPlantTaskSpotLight && (
        <PlantingTaskModal
          goToCatalogue={goToCatalogue}
          dismissModal={() => setShowPlantTaskModal(false)}
          updatePlantTaskSpotlight={updatePlantTaskSpotlight}
        />
      )}
      {showNoManagementPlanModal && (
        <NoCropManagementPlanModal
          dismissModal={() => setShowNoManagementPlanModal(false)}
          goToCatalogue={goToCatalogue}
        />
      )}
    </>
  );
};
