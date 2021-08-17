import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { AddLink, Main } from '../../Typography';
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
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import Button from '../../Form/Button';

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
  taskTypes,
}) => {
  const { t } = useTranslation();
  const icons = {
    SOIL_AMENDMENT: <SoilAmendment />,
    FIELD_WORK: <FieldWork />,
    HARVESTING: <Harvest />,
    IRRIGATION: <Irrigate />,
    PEST_CONTROL: <PestControl />,
    PLANTING: <Plant />,
    SOIL_RESULTS: <RecordSoilSample />,
    SALES: <Sales />,
    SCOUTING: <Scout />,
    SOCIAL: <SocialEvent />,
    TRANSPORT: <Transport />,
    WASH_AND_PACK: <WashAndPack />,
    CLEANING: <Clean />,
  };
  const showOnly = ['SOIL_AMENDMENT', 'FIELD_WORK', 'PEST_CONTROL', 'CLEANING'];
  const { watch, getValues, handleSubmit, register, setValue } = useForm({
    mode: 'onChange',
  });

  useHookFormPersist(getValues, persistedPaths);
  const TASK_TYPE = 'type';
  register(TASK_TYPE, { required: true });
  let selected_task_type = watch(TASK_TYPE);
  let task = persistedFormData?.type;

  const onTileClick = (task) => {
    setValue(TASK_TYPE, task);
    onContinue();
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
          {taskTypes
            ?.filter(
              ({ farm_id, task_translation_key }) =>
                farm_id === null && showOnly.includes(task_translation_key),
            )
            .map(({ task_translation_key, task_type_id }) => {
              return (
                <div
                  onClick={() => {
                    onTileClick(task_type_id);
                  }}
                  key={task_translation_key}
                >
                  <div
                    className={clsx(
                      styles.typeContainer,
                      task === task_type_id && styles.typeContainerSelected,
                    )}
                  >
                    {icons[task_translation_key]}
                    <div>{t(`task:${task_translation_key}`)}</div>
                  </div>
                </div>
              );
            })}
          {/*<div*/}
          {/*  id={'collect_soil_sample'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('collect_soil_sample');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'collect_soil_sample' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <CollectSoilSample/>*/}
          {/*    <div>{t('ADD_TASK.COLLECT_SOIL_SAMPLE')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'fertilize'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('fertilize');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'fertilize' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Fertilize/>*/}
          {/*    <div>{t('ADD_TASK.FERTILIZE')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'field_work'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('field_work');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'field_work' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <FieldWork/>*/}
          {/*    <div>{t('ADD_TASK.FIELD_WORK')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'harvest'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('harvest');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'harvest' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Harvest/>*/}
          {/*    <div>{t('ADD_TASK.HARVEST')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'irrigate'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('irrigate');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'irrigate' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Irrigate/>*/}
          {/*    <div>{t('ADD_TASK.IRRIGATE')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'maintenance'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('maintenance');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'maintenance' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Maintenance/>*/}
          {/*    <div>{t('ADD_TASK.MAINTENANCE')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'pest_control'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('pest_control');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'pest_control' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <PestControl/>*/}
          {/*    <div>{t('ADD_TASK.PEST_CONTROL')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'plant'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('plant');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'plant' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Plant/>*/}
          {/*    <div>{t('ADD_TASK.PLANT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'record_soil_sample'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('record_soil_sample');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'record_soil_sample' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <RecordSoilSample/>*/}
          {/*    <div>{t('ADD_TASK.RECORD_SOIL_SAMPLE')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'sales'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('sales');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'sales' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Sales/>*/}
          {/*    <div>{t('ADD_TASK.SALES')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'scout'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('scout');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'scout' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Scout/>*/}
          {/*    <div>{t('ADD_TASK.SCOUT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'social_event'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('social_event');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'social_event' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <SocialEvent/>*/}
          {/*    <div>{t('ADD_TASK.SOCIAL_EVENT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'soil_amendment'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('soil_amendment');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'soil_amendment' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <SoilAmendment/>*/}
          {/*    <div>{t('ADD_TASK.SOIL_AMENDMENT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'transplant'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('transplant');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'transplant' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Transplant/>*/}
          {/*    <div>{t('ADD_TASK.TRANSPLANT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'transport'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('transport');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'transport' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <Transport/>*/}
          {/*    <div>{t('ADD_TASK.TRANSPORT')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/*<div*/}
          {/*  id={'wash_and_pack'}*/}
          {/*  onClick={() => {*/}
          {/*    onTileClick('wash_and_pack');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <div*/}
          {/*    className={clsx(*/}
          {/*      styles.typeContainer,*/}
          {/*      task === 'wash_and_pack' && styles.typeContainerSelected,*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    <WashAndPack/>*/}
          {/*    <div>{t('ADD_TASK.WASH_AND_PACK')}</div>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>

        <Button color={'success'} onClick={onCustomTask}>
          {t('ADD_TASK.MANAGE_CUSTOM_TASKS')}
        </Button>
      </Form>
    </>
  );
};

export default PureTaskTypeSelection;
