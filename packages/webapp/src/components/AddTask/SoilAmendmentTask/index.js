import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import AddProduct from '../AddProduct';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';

const PureSoilAmendmentTask = (
  {
    system,
    products,
    register,
    control,
    setValue,
    getValues,
    watch,
    farm,
    disabled = false
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
    other:t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER')
  };
  const purposeOptions = Object.keys(purpose).map((k) => ({value: k, label: purpose[k]}))
  const filtered = products.filter(({ type }) => type === 'soil_amendment_task');
  return (
    <>
      <Controller
        control={control}
        name={PURPOSE}
        rules={{}}
        render={({ field: { onChange, value }}) => (
          <ReactSelect
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PURPOSE')}
            style={{ marginBottom: '40px', marginTop: '24px' }}
            options={purposeOptions}
            onChange={onChange}
            value={value}
            isDisabled={disabled}
          />
        )}
      />
      {
        purposeValue?.value === 'other' && (
          <Input
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.OTHER_PURPOSE')}
            style={{ marginBottom: '40px', marginTop: '24px' }}
            name={OTHER_PURPOSE}
            disabled={disabled}
            hookFormRegister={register(OTHER_PURPOSE)}
          />
        )
      }
      <AddProduct
        system={system}
        watch={watch}
        type={'soil_task'}
        register={register}
        getValues={getValues}
        setValue={setValue}
        control={control}
        products={filtered}
        farm={farm}
        disabled={disabled}
      />
    </>
  );
};

export default PureSoilAmendmentTask;
