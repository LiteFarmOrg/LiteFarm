import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import AddProduct from '../AddProduct';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';

const PureSoilAmendmentTask = ({
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
  const PURPOSE = 'soil_amendment_task.purpose';
  const purposeValue = watch(PURPOSE);
  const OTHER_PURPOSE = 'soil_amendment_task.other_purpose';
  const purpose = {
    structure: t('ADD_TASK.SOIL_AMENDMENT_VIEW.STRUCTURE'),
    moisture_retention: t('ADD_TASK.SOIL_AMENDMENT_VIEW.MOISTURE_RETENTION'),
    nutrient_availability: t('ADD_TASK.SOIL_AMENDMENT_VIEW.NUTRIENT_AVAILABILITY'),
    ph: t('ADD_TASK.SOIL_AMENDMENT_VIEW.PH'),
    other: t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER'),
  };
  const purposeOptions = Object.keys(purpose).map((k) => ({ value: k, label: purpose[k] }));
  const purposeExposedValue = purposeValue?.value
    ? purposeValue
    : { value: purposeValue, label: purpose[purposeValue] };
  return (
    <>
      <Controller
        control={control}
        name={PURPOSE}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PURPOSE')}
            style={{ marginBottom: '40px' }}
            options={purposeOptions}
            onChange={(e) => {
              onChange(e);
              setValue(PURPOSE, e, { shouldValidate: true });
            }}
            value={value?.value ? value : { value, label: purpose[value] }}
            isDisabled={disabled}
          />
        )}
      />
      {purposeExposedValue?.value === 'other' && (
        <Input
          label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_PURPOSE')}
          style={{ marginBottom: '40px' }}
          name={OTHER_PURPOSE}
          disabled={disabled}
          hookFormRegister={register(OTHER_PURPOSE)}
          optional
        />
      )}
      <AddProduct
        system={system}
        watch={watch}
        type={'soil_amendment_task'}
        register={register}
        getValues={getValues}
        setValue={setValue}
        control={control}
        products={products}
        formState={formState}
        farm={farm}
        disabled={disabled}
      />
    </>
  );
};

export default PureSoilAmendmentTask;
