import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import styles from './styles.module.scss';
import { ReactComponent as CollectSoilSample } from '../../../assets/images/task/CollectSoilSample.svg';
import { ReactComponent as Transport } from '../../../assets/images/task/Transport.svg';
import { ReactComponent as Clean } from '../../../assets/images/task/Clean.svg';
import { ReactComponent as Fertilize } from '../../../assets/images/task/Fertilize.svg';
import { ReactComponent as FieldWork } from '../../../assets/images/task/FieldWork.svg';
import { ReactComponent as Harvest } from '../../../assets/images/task/Harvest.svg';
import { ReactComponent as Irrigate } from '../../../assets/images/task/Irrigate.svg';
import { ReactComponent as Maintenance } from '../../../assets/images/task/Maintenance.svg';
import { ReactComponent as PestControl } from '../../../assets/images/task/PestControl.svg';
import { ReactComponent as Plant } from '../../../assets/images/task/Plant.svg';
import { ReactComponent as RecordSoilSample } from '../../../assets/images/task/RecordSoilSample.svg';
import { ReactComponent as Sales } from '../../../assets/images/task/Sales.svg';
import { ReactComponent as Scout } from '../../../assets/images/task/Scout.svg';
import { ReactComponent as SocialEvent } from '../../../assets/images/task/SocialEvent.svg';
import { ReactComponent as SoilAmendment } from '../../../assets/images/task/SoilAmendment.svg';
import { ReactComponent as Transplant } from '../../../assets/images/task/Transplant.svg';
import { ReactComponent as WashAndPack } from '../../../assets/images/task/WashAndPack.svg';
import { ReactComponent as CustomTask } from '../../../assets/images/task/Custom.svg';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import Button from '../../Form/Button';

const icons = {
  SOIL_AMENDMENT_TASK: <SoilAmendment />,
  FIELD_WORK_TASK: <FieldWork />,
  HARVEST_TASK: <Harvest />,
  IRRIGATION_TASK: <Irrigate />,
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

/**
 *
 * @param isAdmin {boolean}
 * @return {Set<string>}
 */
const getSupportedTaskTypes = (isAdmin) => {
  const supportedTaskTypes = new Set([
    'SOIL_AMENDMENT_TASK',
    'FIELD_WORK_TASK',
    'PEST_CONTROL_TASK',
    'CLEANING_TASK',
    'HARVEST_TASK',
    'TRANSPLANT_TASK',
  ]);
  isAdmin && supportedTaskTypes.add('PLANT_TASK');
  return supportedTaskTypes;
};

export const PureTaskTypeSelection = ({
  onCustomTask,
  handleGoBack,
  handleCancel,
  history,
  persistedPaths,
  persistedFormData,
  useHookFormPersist,
  onContinue,
  onError,
  taskTypes,
  customTasks,
  isAdmin,
  shouldNotShowPlantTaskSpotLight,
  children,
}) => {
  const { t } = useTranslation();
  const { watch, getValues, register, setValue } = useForm({
    defaultValues: persistedFormData,
  });

  useHookFormPersist(getValues, persistedPaths);
  const TASK_TYPE_ID = 'task_type_id';
  register(TASK_TYPE_ID);
  const selected_task_type = watch(TASK_TYPE_ID);

  const onTileClick = (task_type_id) => {
    setValue(TASK_TYPE_ID, task_type_id);
    onContinue();
  };

  const [isPlantTaskTileClicked, setPlantTaskTileClicked] = useState();
  const onPlantTaskTypeClick = (task_type_id) => {
    if (shouldNotShowPlantTaskSpotLight) {
      setValue(TASK_TYPE_ID, task_type_id);
      history.push('/crop_catalogue');
    } else {
      setPlantTaskTileClicked(true);
    }
  };

  return (
    <>
      <Form>
        <MultiStepPageTitle
          style={{ marginBottom: '20px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={14}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.SELECT_TASK_TYPE')}</Main>

        <div style={{ paddingBottom: '20px' }} className={styles.matrixContainer}>
          {taskTypes
            ?.filter(({ farm_id, task_translation_key }) => {
              const supportedTaskTypes = getSupportedTaskTypes(isAdmin);
              return farm_id === null && supportedTaskTypes.has(task_translation_key);
            })
            .map(({ task_translation_key, task_type_id, farm_id }) => {
              return (
                <div
                  onClick={() => {
                    task_translation_key === 'PLANT_TASK' && !farm_id
                      ? onPlantTaskTypeClick(task_type_id)
                      : onTileClick(task_type_id);
                  }}
                  key={task_type_id}
                  className={clsx(
                    styles.typeContainer,
                    selected_task_type === task_type_id && styles.typeContainerSelected,
                  )}
                >
                  {icons[task_translation_key]}
                  <div>{t(`task:${task_translation_key}`)}</div>
                </div>
              );
            })}
          {customTasks?.map(({ task_translation_key, task_type_id, task_name }) => {
            return (
              <div
                onClick={() => {
                  onTileClick(task_type_id);
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
                  <div>{task_name}</div>
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
      {isPlantTaskTileClicked && !shouldNotShowPlantTaskSpotLight && children}
    </>
  );
};
