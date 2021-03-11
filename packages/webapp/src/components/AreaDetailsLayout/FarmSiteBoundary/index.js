import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';

export default function PureFarmSiteBoundary({ onGoBack }) {
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
  const onSubmit = (data) => {};
  const disabled = !isValid || isDirty;

  return (
    <AreaDetailsLayout
      title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
      name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
      onBack={onGoBack}
      onSubmit={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      register={register}
      disabled={disabled}
      isNameRequired={false}
    />
  );
}
