import Layout from '../../Layout';
import Button from '../../Form/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import LocationViewer from '../../LocationViewer';
import { Label, Underlined, Semibold } from '../../Typography';
import styles from './styles.module.scss';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
import useCropTileListGap from '../../CropTile/useCropTileListGap';
import PageBreak from '../../PageBreak';
import { useForm } from 'react-hook-form';
import PureCleaningTask from '../../AddTask/CleaningTask';
import { cloneObject } from '../../../util';

export default function PureTaskReadOnly({
  onGoBack,
  onComplete,
  onEdit,
  onAbandon,
  task,
  users,
  user,
  isAdmin,
  system,
  products,
  managementPlansByLocationIds,
}) {
  const { t } = useTranslation();
  const taskType = task.taskType[0];
  const dueDate = task.due_date.split('T')[0];
  const locations = task.locations.map(({ location_id }) => location_id);
  const owner = task.owner_user_id;
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(task),
  });
  console.log(watch());
  const taskComponents = {
    // CLEANING: (props) => <PureCleaningTask  farm={user.farm_id} system={system} products={getTaskProductAsArray()}  {...props} />
  }
  const taskTypeKey = {
    CLEANING: 'cleaning_task'
  }

  const self = user.user_id;

  let assignee = null;
  for (let user of users) {
    if (user.user_id === task.assignee_user_id) {
      assignee = user.first_name + ' ' + user.last_name;
    }
  }

  const { ref: gap, padding } = useCropTileListGap([]);

  return (
    <Layout
      buttonGroup={
        self === task.assignee_user_id && (
          <>
            <Button color={'primary'} onClick={onComplete} fullLength>
              {t('common:MARK_COMPLETE')}
            </Button>
          </>
        )
      }
    >
      <PageTitle
        onGoBack={onGoBack}
        style={{ marginBottom: '24px' }}
        title={t(`task:${taskType.task_translation_key}`) + ' ' + t('TASK.TASK')}
        onEdit={isAdmin || owner === self ? onEdit : false}
        editLink={t('TASK.EDIT_TASK')}
      ></PageTitle>

      <Input
        style={{ marginBottom: '40px' }}
        label={t('ADD_TASK.ASSIGNEE')}
        isSearchBar={true}
        disabled={true}
        value={assignee}
      />

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        value={dueDate}
        label={t('TASK.DUE_DATE')}
        disabled
      />

      <Label style={{ marginBottom: '12px' }}>{t('TASK.TARGET')}</Label>

      <LocationViewer className={styles.mapContainer} viewLocations={locations} />

      {Object.keys(managementPlansByLocationIds).map((location_id) => {
        let location_name =
          managementPlansByLocationIds[location_id][0].planting_management_plans.final.location
            .name;
        return (
          <>
            <div style={{ paddingBottom: '16px' }}>
              <PageBreak style={{ paddingBottom: '16px' }} label={location_name} />
            </div>
            <PureCropTileContainer gap={gap} padding={padding}>
              {managementPlansByLocationIds[location_id].map((plan) => {
                return (
                  <PureManagementPlanTile key={plan.management_plan_id} managementPlan={plan} />
                );
              })}
            </PureCropTileContainer>
          </>
        );
      })}

      <Semibold style={{ marginTop: '8px', marginBottom: '18px' }}>
        {t(`task:${taskType.task_translation_key}`) + ' ' + t('TASK.DETAILS')}
      </Semibold>

      {/*{*/}
      {/*  taskComponents[taskType.task_translation_key]({*/}
      {/*  setValue,*/}
      {/*  getValues,*/}
      {/*  watch,*/}
      {/*  control,*/}
      {/*  register,*/}
      {/*  disabled: true*/}
      {/*})*/}
      {/*}*/}

      {
        taskType.task_translation_key === 'CLEANING' &&
          <PureCleaningTask
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            control={control}
            products={products}
            system={system}
            register={register}
            farm={user.farm_id}
            disabled={false}
          />
      }
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('common:NOTES')}
        value={task.notes}
        optional
        disabled
      />

      {(self === task.assignee_user_id || self === owner || isAdmin) && (
        <Underlined style={{ marginBottom: '16px' }} onClick={onAbandon}>
          {t('TASK.ABANDON_TASK')}
        </Underlined>
      )}
    </Layout>
  );
}
