import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { AddLink, Main } from '../../Typography';
import styles from './styles.module.scss';
import { ReactComponent as CollectSoilSample } from '../../../assets/images/AddTask/Collect Soil Sample.svg';
import { ReactComponent as Custom } from '../../../assets/images/AddTask/Custom.svg';
import { ReactComponent as Transport } from '../../../assets/images/AddTask/Transport.svg';
import { ReactComponent as Fertilize } from '../../../assets/images/AddTask/Fertilize.svg';
import { ReactComponent as FieldWork } from '../../../assets/images/AddTask/Field Work.svg';
import { ReactComponent as Harvest } from '../../../assets/images/AddTask/Harvest.svg';
import { ReactComponent as Irrigate } from '../../../assets/images/AddTask/Irrigate.svg';
import { ReactComponent as Maintenance } from '../../../assets/images/AddTask/Maintenance.svg';
import { ReactComponent as PestControl } from '../../../assets/images/AddTask/Pest Control.svg';
import { ReactComponent as Plant } from '../../../assets/images/AddTask/Plant.svg';
import { ReactComponent as RecordSoilSample } from '../../../assets/images/AddTask/Record Soil Sample.svg';
import { ReactComponent as Sales } from '../../../assets/images/AddTask/Sales.svg';
import { ReactComponent as Scout } from '../../../assets/images/AddTask/Scout.svg';
import { ReactComponent as SocialEvent } from '../../../assets/images/AddTask/Social Event.svg';
import { ReactComponent as SoilAmendment } from '../../../assets/images/AddTask/Soil Amendment.svg';
import { ReactComponent as Transplant } from '../../../assets/images/AddTask/Transplant.svg';
import { ReactComponent as WashAndPack } from '../../../assets/images/AddTask/Wash _ Pack.svg';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

const PureTaskTypeSelection = ({
  onCustomTask,
  handleGoBack,
  handleCancel,
  history,
  persistedPaths,
  persistedFormData,
  useHookFormPersist,
  onContinue,
  onError,
}) => {
  const { t } = useTranslation();

  const { watch, getValues, handleSubmit, register, setValue } = useForm({
    mode: 'onChange',
  });

  useHookFormPersist(persistedPaths, getValues);
  const TASK_TYPE = 'task_type';
  register(TASK_TYPE, { required: true });
  const selected_task_type = watch(TASK_TYPE);

  const onTileClick = (task) => {
    setValue(TASK_TYPE, task);
    //handleSubmit(onContinue, onError);
    onContinue();
    //history.push('/tasks/:management_plan_id/add_task/task_date');
  };

  return (
    <>
      <Form>
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={14}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.SELECT_TASK_TYPE')}</Main>

        <div className={styles.tileContainer}>
          <div
            id={'collect_soil_sample'}
            onClick={() => {
              onTileClick('collect_soil_sample');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'collect_soil_sample' && styles.typeContainerSelected,
              )}
            >
              <CollectSoilSample />
              <div>{t('ADD_TASK.COLLECT_SOIL_SAMPLE')}</div>
            </div>
          </div>

          <div
            id={'fertilize'}
            onClick={() => {
              onTileClick('fertilize');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'fertilize' && styles.typeContainerSelected,
              )}
            >
              <Fertilize />
              <div>{t('ADD_TASK.FERTILIZE')}</div>
            </div>
          </div>

          <div
            id={'field_work'}
            onClick={() => {
              onTileClick('field_work');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'field_work' && styles.typeContainerSelected,
              )}
            >
              <FieldWork />
              <div>{t('ADD_TASK.FIELD_WORK')}</div>
            </div>
          </div>

          <div
            id={'harvest'}
            onClick={() => {
              onTileClick('harvest');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'harvest' && styles.typeContainerSelected,
              )}
            >
              <Harvest />
              <div>{t('ADD_TASK.HARVEST')}</div>
            </div>
          </div>

          <div
            id={'irrigate'}
            onClick={() => {
              onTileClick('irrigate');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'irrigate' && styles.typeContainerSelected,
              )}
            >
              <Irrigate />
              <div>{t('ADD_TASK.IRRIGATE')}</div>
            </div>
          </div>

          <div
            id={'maintenance'}
            onClick={() => {
              onTileClick('maintenance');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'maintenance' && styles.typeContainerSelected,
              )}
            >
              <Maintenance />
              <div>{t('ADD_TASK.MAINTENANCE')}</div>
            </div>
          </div>

          <div
            id={'pest_control'}
            onClick={() => {
              onTileClick('pest_control');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'pest_control' && styles.typeContainerSelected,
              )}
            >
              <PestControl />
              <div>{t('ADD_TASK.PEST_CONTROL')}</div>
            </div>
          </div>

          <div
            id={'plant'}
            onClick={() => {
              onTileClick('plant');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'plant' && styles.typeContainerSelected,
              )}
            >
              <Plant />
              <div>{t('ADD_TASK.PLANT')}</div>
            </div>
          </div>

          <div
            id={'record_soil_sample'}
            onClick={() => {
              onTileClick('record_soil_sample');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'record_soil_sample' && styles.typeContainerSelected,
              )}
            >
              <RecordSoilSample />
              <div>{t('ADD_TASK.RECORD_SOIL_SAMPLE')}</div>
            </div>
          </div>

          <div
            id={'sales'}
            onClick={() => {
              onTileClick('sales');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'sales' && styles.typeContainerSelected,
              )}
            >
              <Sales />
              <div>{t('ADD_TASK.SALES')}</div>
            </div>
          </div>

          <div
            id={'scout'}
            onClick={() => {
              onTileClick('scout');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'scout' && styles.typeContainerSelected,
              )}
            >
              <Scout />
              <div>{t('ADD_TASK.SCOUT')}</div>
            </div>
          </div>

          <div
            id={'social_event'}
            onClick={() => {
              onTileClick('social_event');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'social_event' && styles.typeContainerSelected,
              )}
            >
              <SocialEvent />
              <div>{t('ADD_TASK.SOCIAL_EVENT')}</div>
            </div>
          </div>

          <div
            id={'soil_amendment'}
            onClick={() => {
              onTileClick('soil_amendment');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'soil_amendment' && styles.typeContainerSelected,
              )}
            >
              <SoilAmendment />
              <div>{t('ADD_TASK.SOIL_AMENDMENT')}</div>
            </div>
          </div>

          <div
            id={'transplant'}
            onClick={() => {
              onTileClick('transplant');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'transplant' && styles.typeContainerSelected,
              )}
            >
              <Transplant />
              <div>{t('ADD_TASK.TRANSPLANT')}</div>
            </div>
          </div>

          <div
            id={'transport'}
            onClick={() => {
              onTileClick('transport');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'transport' && styles.typeContainerSelected,
              )}
            >
              <Transport />
              <div>{t('ADD_TASK.TRANSPORT')}</div>
            </div>
          </div>

          <div
            id={'wash_and_pack'}
            onClick={() => {
              onTileClick('wash_and_pack');
            }}
          >
            <div
              className={clsx(
                styles.typeContainer,
                selected_task_type === 'wash_and_pack' && styles.typeContainerSelected,
              )}
            >
              <WashAndPack />
              <div>{t('ADD_TASK.WASH_AND_PACK')}</div>
            </div>
          </div>
        </div>

        <AddLink onClick={onCustomTask} style={{ paddingTop: '20px' }}>
          {t('ADD_TASK.CREATE_CUSTOM_TASK')}
        </AddLink>
      </Form>
    </>
  );
};

export default PureTaskTypeSelection;
