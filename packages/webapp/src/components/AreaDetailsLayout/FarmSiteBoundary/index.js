import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';

export default function PureFarmSiteBoundary({ history }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {
    console.log(data);
  };
  const disabled = !isValid || !isDirty;
  console.log(errors, isDirty, isValid);

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
