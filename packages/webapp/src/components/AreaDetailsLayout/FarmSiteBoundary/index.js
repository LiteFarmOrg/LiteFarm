import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';

export default function PureFarmSiteBoundary({
  history,
  submitForm,
  system,
  grid_points,
  area,
  perimeter,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    setError,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      ...data,
      grid_points: grid_points,
      type: 'farm_site_boundary',
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
      title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      showPerimeter={true}
      errors={errors}
      system={system}
      area={area}
      perimeter={perimeter}
    />
  );
}
