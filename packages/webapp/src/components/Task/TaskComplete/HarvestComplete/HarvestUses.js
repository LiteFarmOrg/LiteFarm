import React, { useState } from 'react';
import MultiStepPageTitle from '../../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../../Form';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import Button from '../../../Form/Button';
import { Label, Main, AddLink } from '../../../Typography';
import Unit from '../../../Form/Unit';
import { harvestAmounts } from '../../../../util/unit';
import ReactSelect from '../../../Form/ReactSelect';
import UnitLabel from './UnitLabel';

export default function PureHarvestUses({
  onContinue,
  onCancel,
  onGoBack,
  system,
  persistedFormData,
  persistedPaths,
  useHookFormPersist,
  amount,
  unit,
  harvestUseTypes,
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
      harvest_uses: [{ amount: '', unit: '' }],
    },
  });

  useHookFormPersist(getValues, persistedPaths);

  const progress = 50;

  const HARVEST_USE_QUANTITY_UNIT = 'harvest_use_quantity_unit';
  const HARVEST_USE_QUANTITY = 'harvest_use_quantity';
  const HARVEST_USE_TYPE = 'harvest_use_type';

  const disabled = !isValid;

  const [allocated_amount, setAllocatedAmount] = useState(amount);
  const { fields, append } = useFieldArray({
    control,
    name: 'harvest_uses',
    shouldUnregister: false,
  });

  const harvest_uses_options = harvestUseTypes.map((harvestUseType) => ({
    value: harvestUseType.harvest_use_type_id,
    label: harvestUseType.harvest_use_type_name,
  }));

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.HARVEST_USE')}</Main>


      <Label style={{ marginBottom: '16px' }}>
        {t('TASK.AMOUNT_TO_ALLOCATE')}
        <UnitLabel
          style={{ marginLeft: '12px' }}
          amount={allocated_amount}
          unitLabel={unit}
        />
      </Label>

      <AddLink
        style={{ marginBottom: '24px' }}
        onClick={() => {
          // TODO - Add custom harvest use
        }}
      >
        {t('TASK.ADD_CUSTOM_HARVEST_USE')}
      </AddLink>

      {fields.map((field, index) => {
        return (
          <div>
            <Controller
              control={control}
              name={`harvest_uses.${index}.` + HARVEST_USE_TYPE}
              render={({ field }) => (
                <ReactSelect
                  options={harvest_uses_options}
                  label={t('TASK.HARVEST_USE')}
                  required={true}
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <Unit
              register={register}
              style={{ marginBottom: '14px', marginTop: '40px' }}
              label={t('ADD_TASK.QUANTITY')}
              name={`harvest_uses.${index}.` + HARVEST_USE_QUANTITY}
              displayUnitName={`harvest_uses.${index}.` + HARVEST_USE_QUANTITY_UNIT}
              unitType={harvestAmounts}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              required
            />
          </div>
        )
      })}

      <AddLink 
        style={ {marginTop: '16px' }}
        onClick={() => {
          append({ amount: '', unit: '' });
        }}
      >
        {t('TASK.ADD_HARVEST_USE')}
      </AddLink>
    </Form>
  );
}
