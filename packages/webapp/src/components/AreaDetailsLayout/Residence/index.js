import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import { residenceEnum } from '../../../containers/residenceSlice';

export default function PureResidence({ history, submitForm, system, grid_points }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
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
      type: 'residence_details',
    };
    submitForm({ formData });
  };

  return (
    <AreaDetailsLayout
      name={t('FARM_MAP.RESIDENCE.NAME')}
      title={t('FARM_MAP.RESIDENCE.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      register={register}
      isNameRequired={true}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      getValues={getValues}
      setError={setError}
      control={control}
      showPerimeter={false}
      errors={errors}
      system={system}
    ></AreaDetailsLayout>
  );
}
