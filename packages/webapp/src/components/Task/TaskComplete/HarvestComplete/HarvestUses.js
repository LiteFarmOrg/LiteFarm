import React, { useMemo } from 'react';
import MultiStepPageTitle from '../../../PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import Form from '../../../Form';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Button from '../../../Form/Button';
import { AddLink, Label, Main, SubtractLink } from '../../../Typography';
import Unit from '../../../Form/Unit';
import { harvestAmounts, roundToTwoDecimal } from '../../../../util/unit';
import ReactSelect from '../../../Form/ReactSelect';
import UnitLabel from './UnitLabel';
import { cloneObject } from '../../../../util';
import { colors } from '../../../../assets/theme';

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
  task,
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
      harvest_uses: persistedFormData?.harvest_uses ?? [{}],
      ...cloneObject(task),
    },
  });

  useHookFormPersist(getValues, persistedPaths);

  const progress = 50;

  const HARVEST_USE_QUANTITY_UNIT = 'quantity_unit';
  const HARVEST_USE_QUANTITY = 'quantity';
  const HARVEST_USE_TYPE = 'harvest_use_type_id';

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'harvest_uses',
    shouldUnregister: false,
  });

  const watchFields = watch('harvest_uses');
  const quantities = watchFields.map((field) => field[HARVEST_USE_QUANTITY]);

  const { allocated_amount, amount_to_allocate } = useMemo(() => {
    let allocated_amount = 0;
    for (let field of watchFields) {
      let q = field[HARVEST_USE_QUANTITY];
      if (q !== undefined) {
        allocated_amount += isNaN(q) ? 0 : q;
      }
    }
    return { allocated_amount, amount_to_allocate: amount - allocated_amount };
  }, [quantities]);

  const harvestUseIds = watchFields.map((field) => field?.[HARVEST_USE_TYPE]?.value);

  const harvest_uses_options = useMemo(() => {
    return harvestUseTypes
      .map((harvestUseType) => ({
        value: harvestUseType.harvest_use_type_id,
        label: t(`harvest_uses:${harvestUseType.harvest_use_type_translation_key}`),
      }))
      .filter((harvestUseType) => !harvestUseIds.includes(harvestUseType.value));
  }, [harvestUseIds]);

  const disabled = !isValid || roundToTwoDecimal(amount_to_allocate) !== 0;

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
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={progress}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.HOW_WILL_HARVEST_BE_USED')}</Main>

      <Label style={{ marginBottom: '16px' }}>
        {t('TASK.AMOUNT_TO_ALLOCATE')}
        <UnitLabel style={{ marginLeft: '12px' }} amount={amount_to_allocate} unitLabel={unit} />
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
        );
      })}

      <AddLink
        style={{ color: colors.blue700 }}
        onClick={() => {
          append({});
        }}
      >
        {t('TASK.ADD_HARVEST_USE')}
      </AddLink>
    </Form>
  );
}
