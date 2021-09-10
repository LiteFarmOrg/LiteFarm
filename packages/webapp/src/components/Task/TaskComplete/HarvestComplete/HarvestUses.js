import React, { useEffect, useState } from 'react';
import MultiStepPageTitle from '../../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../../Form';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import Button from '../../../Form/Button';
import { Label, Main, AddLink, SubtractLink } from '../../../Typography';
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
      harvest_uses: [{}],
    },
  });

  useHookFormPersist(getValues, persistedPaths);

  const progress = 50;

  const HARVEST_USE_QUANTITY_UNIT = 'harvest_use_quantity_unit';
  const HARVEST_USE_QUANTITY = 'harvest_use_quantity';
  const HARVEST_USE_TYPE = 'harvest_use_type';

  const [allocated_amount, setAllocatedAmount] = useState(0);

  const [amount_to_allocate, setAmountToAllocate] = useState(amount);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'harvest_uses',
    shouldUnregister: false,
  });

  const harvest_uses_options = harvestUseTypes.map((harvestUseType) => ({
    value: harvestUseType.harvest_use_type_id,
    label: harvestUseType.harvest_use_type_name,
  }));

  const watchFields = watch('harvest_uses');
  
  useEffect(() => {
    let all_q = 0;
    for (let field of watchFields) {
      let q = field[HARVEST_USE_QUANTITY];
      if (q !== undefined) {
        all_q += q;
      }
    }
    setAllocatedAmount(all_q);
  }, [watchFields]);

  useEffect(() => {
    setAmountToAllocate(amount - allocated_amount);
  }, [allocated_amount]);

  const disabled = !isValid || amount_to_allocate !== 0;

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

      <Main style={{ marginBottom: '24px' }}>{t('TASK.HOW_WILL_HARVEST_BE_USED')}</Main>


      <Label style={{ marginBottom: '16px' }}>
        {t('TASK.AMOUNT_TO_ALLOCATE')}
        <UnitLabel
          style={{ marginLeft: '12px' }}
          amount={amount_to_allocate}
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
            {fields.length > 1 && (
              <SubtractLink
                style={{ float: 'right', color: '#AA5F04', marginBottom: '24px' }}
                color={'#AA5F04'}
                onClick={() => {
                  remove(index);
                }}
              >
                {t('TASK.REMOVE_HARVEST_USE')}
              </SubtractLink>
            )}
          </div>
        )
      })}

      <AddLink 
        style={ { color: '#0669E1' }}
        onClick={() => {
          append({});
        }}
        color={'#0669E1'}
      >
        {t('TASK.ADD_HARVEST_USE')}
      </AddLink>
    </Form>
  );
}
