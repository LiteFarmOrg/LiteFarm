import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';

export default function PureFarmSiteBoundary({ history, submitForm }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {
    submitForm(data);
  };
  const disabled = !isValid || !isDirty;

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
      title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
      history={history}
      onSubmit={onSubmit}
      onError={onError}
      register={register}
      isNameRequired={false}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      showPerimeter={true}
    />
  );
}
