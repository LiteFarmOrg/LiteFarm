import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetailsLayout from '..';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { locationInfoSelector } from '../../../containers/mapSlice';

export default function PureGate({ history, submitForm, pointType }) {
  const { t } = useTranslation();
  const { point } = useSelector(locationInfoSelector);
  const {
    handleSubmit,
    setValue,
    register,
    errors,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const disabled = !isValid || !isDirty;

  const onError = (data) => {};
  const onSubmit = (data) => {
    const formData = {
      name: data.name,
      point: point,
      notes: data.notes,
      type: 'gate',
    };
    submitForm({ formData });
  };

  return (
    <PointDetailsLayout
      name={t('FARM_MAP.GATE.NAME')}
      title={t('FARM_MAP.GATE.TITLE')}
      history={history}
      submitForm={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      setValue={setValue}
      register={register}
      disabled={disabled}
      errors={errors}
    />
  );
}
