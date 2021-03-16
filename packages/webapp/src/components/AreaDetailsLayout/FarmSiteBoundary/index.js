import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetailsLayout from '..';
import { useForm } from 'react-hook-form';
import { locationInfoSelector } from '../../../containers/mapSlice';
import { useSelector } from 'react-redux';

export default function PureFarmSiteBoundary({ history, submitForm, areaType }) {
  const { t } = useTranslation();
  const { grid_points } = useSelector(locationInfoSelector);
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const onSubmit = (data) => {
    const formData = {
      name: data.name,
      total_area: parseInt(data.total_area),
      perimeter: parseInt(data.perimeter),
      grid_points: grid_points,
      notes: data.notes,
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
      isNameRequired={false}
      disabled={disabled}
      handleSubmit={handleSubmit}
      setValue={setValue}
      showPerimeter={true}
      errors={errors}
      areaType={areaType}
    />
  );
}
