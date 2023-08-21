import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import AddProduct from '../AddProduct';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';

const PurePestControlTask = ({
  system,
  products,
  register,
  control,
  setValue,
  getValues,
  formState,
  watch,
  farm,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const CONTROL_METHOD = 'pest_control_task.control_method';
  const controlMethodValue = watch(CONTROL_METHOD);
  const OTHER_PURPOSE = 'pest_control_task.other_method';
  const PEST_TARGET = 'pest_control_task.pest_target';
  const productPests = ['foliarSpray', 'soilFumigation', 'systemicSpray'];
  const controlMethod = {
    biologicalControl: t('ADD_TASK.PEST_CONTROL_VIEW.BIOLOGICAL_CONTROL'),
    flameWeeding: t('ADD_TASK.PEST_CONTROL_VIEW.FLAME_WEEDING'),
    foliarSpray: t('ADD_TASK.PEST_CONTROL_VIEW.FOLIAR_SPRAY'),
    handWeeding: t('ADD_TASK.PEST_CONTROL_VIEW.HAND_WEEDING'),
    heatTreatment: t('ADD_TASK.PEST_CONTROL_VIEW.HEAT_TREATMENT'),
    soilFumigation: t('ADD_TASK.PEST_CONTROL_VIEW.SOIL_FUMIGATION'),
    systemicSpray: t('ADD_TASK.PEST_CONTROL_VIEW.SYSTEMIC_SPRAY'),
    other: t('ADD_TASK.PEST_CONTROL_VIEW.OTHER'),
  };
  const controlMethodOptions = Object.keys(controlMethod).map((k) => ({
    value: k,
    label: controlMethod[k],
  }));
  const controlMethodExposedValue = useMemo(() => {
    return controlMethodValue?.value
      ? controlMethodValue
      : { value: controlMethodValue, label: controlMethod[controlMethodValue] };
  }, [controlMethodValue]);

  //TODO: Need performance optimization check as it is setting values to null
  //for few conditions even when not required.
  useEffect(() => {
    if (
      controlMethodExposedValue?.value &&
      !productPests.includes(controlMethodExposedValue?.value)
    ) {
      setValue('pest_control_task.product', null);
      setValue('pest_control_task.product_id', null);
      setValue('pest_control_task.product_quantity', undefined);
      setValue('pest_control_task.product_quantity_unit', null, { shouldValidate: true });
    }
    if (controlMethodExposedValue?.value !== 'other') {
      setValue('pest_control_task.other_method', null);
    }
  }, [controlMethodExposedValue]);

  return (
    <>
      <Input
        label={t('ADD_TASK.PEST_CONTROL_VIEW.WHAT_PESTS')}
        style={{ marginBottom: '40px' }}
        name={PEST_TARGET}
        disabled={disabled}
        optional={true}
        hookFormRegister={register(PEST_TARGET)}
      />
      <Controller
        control={control}
        name={CONTROL_METHOD}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ADD_TASK.PEST_CONTROL_VIEW.PEST_CONTROL_METHOD')}
            style={{ marginBottom: '40px' }}
            onChange={(e) => {
              onChange(e);
              setValue(CONTROL_METHOD, e, { shouldValidate: true });
            }}
            placeholder={t('common:SELECT')}
            value={!value ? value : value?.value ? value : { value, label: controlMethod[value] }}
            options={controlMethodOptions}
            isDisabled={disabled}
          />
        )}
      />
      {controlMethodExposedValue?.value === 'other' && (
        <Input
          label={t('ADD_TASK.PEST_CONTROL_VIEW.OTHER_PEST')}
          style={{ marginBottom: '24px' }}
          name={OTHER_PURPOSE}
          disabled={disabled}
          hookFormRegister={register(OTHER_PURPOSE, { required: true })}
        />
      )}
      {productPests.includes(controlMethodExposedValue?.value) && (
        <AddProduct
          system={system}
          watch={watch}
          type={'pest_control_task'}
          register={register}
          getValues={getValues}
          setValue={setValue}
          control={control}
          formState={formState}
          products={products}
          farm={farm}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default PurePestControlTask;
