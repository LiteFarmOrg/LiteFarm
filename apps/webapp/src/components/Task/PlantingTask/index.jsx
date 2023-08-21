import React from 'react';
import { useTranslation } from 'react-i18next';

import { Main } from '../../Typography';
import { PureBroadcastForm } from '../../Crop/BroadcastPlan/PureBroadcastForm';
import PureContainerForm from '../../Crop/PlantInContainer/PureContainerForm';
import PureRowForm from '../../Crop/RowMethod/PureRowForm';
import { PurePlanGuidanceForm } from '../../Crop/BedPlan/PurePlanGuidanceForm';
import { PureBedForm } from '../../Crop/BedPlan/PureBedForm';

export function PurePlantingTask({
  task,
  setValue,
  getValues,
  watch,
  control,
  register,
  errors,
  system,
  isPlantTask,
  disabled,
}) {
  const { t } = useTranslation();
  const crop_variety = task?.managementPlans?.[0]?.crop_variety;
  const taskType = isPlantTask ? 'plant_task' : 'transplant_task';
  const yieldPerArea = crop_variety?.yield_per_area || 0;
  const locationSize = task[taskType]?.planting_management_plan?.location?.total_area || 0;
  const plantingMethod = task[taskType]?.planting_management_plan.planting_method;
  const plantingMethodTranslation = {
    ROW_METHOD: t('MANAGEMENT_PLAN.ROWS'),
    BED_METHOD: t('MANAGEMENT_PLAN.BEDS'),
    CONTAINER_METHOD: t('MANAGEMENT_PLAN.INDIVIDUAL_CONTAINER'),
    BROADCAST_METHOD: t('MANAGEMENT_PLAN.BROADCAST'),
  };
  return (
    <>
      {isPlantTask && (
        <Main style={{ marginBottom: '16px' }}>
          {t('ADD_TASK.PLANTING_FROM')}:{' '}
          {task.managementPlans?.[0]?.crop_management_plan?.is_seed
            ? t('ADD_TASK.SEED')
            : t('ADD_TASK.PLANTING_STOCK')}
        </Main>
      )}

      <Main style={{ marginBottom: '24px' }}>
        {isPlantTask ? t('ADD_TASK.PLANTING_METHOD') : t('ADD_TASK.TRANSPLANT_METHOD')}:{' '}
        {plantingMethodTranslation[plantingMethod]}{' '}
      </Main>

      {plantingMethodForm[plantingMethod]({
        system,
        locationSize,
        yieldPerArea,
        register,
        getValues,
        watch,
        control,
        setValue,
        errors,
        prefix: `${taskType}.planting_management_plan`,
        crop_variety,
        disabled,
      })}
    </>
  );
}

const plantingMethodForm = {
  BROADCAST_METHOD: PureBroadcastForm,
  CONTAINER_METHOD: PureContainerForm,
  ROW_METHOD: (props) => (
    <>
      <PureRowForm {...props} />
      <PurePlanGuidanceForm isBed={false} {...props} />
    </>
  ),
  BED_METHOD: (props) => (
    <>
      <PureBedForm {...props} />
      <PurePlanGuidanceForm isBed={true} {...props} />
    </>
  ),
};
