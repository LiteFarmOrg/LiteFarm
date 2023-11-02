import React from 'react';
import MultiStepPageTitle from '../../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../../Form/Button';
import { Main } from '../../../Typography';
import Unit from '../../../Form/Unit';
import { harvestAmounts } from '../../../../util/convert-units/unit';

export default function PureHarvestCompleteQuantity({
  onContinue,
  onGoBack,
  system,
  task,
  persistedFormData,

  useHookFormPersist,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      ...persistedFormData,
      actual_quantity: persistedFormData.actual_quantity || task.harvest_task.projected_quantity,
    },
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const progress = 25;

  const ACTUAL_HARVEST_QUANTITY = 'actual_quantity';
  const ACTUAL_HARVEST_QUANTITY_UNIT = 'actual_quantity_unit';

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="harvestQuantity-continue" type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_HARVEST_QUANTITY')}</Main>

      <Unit
        data-cy="harvestQuantity-quantity"
        register={register}
        label={t('common:QUANTITY')}
        name={ACTUAL_HARVEST_QUANTITY}
        displayUnitName={ACTUAL_HARVEST_QUANTITY_UNIT}
        unitType={harvestAmounts}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required
      />
    </Form>
  );
}
