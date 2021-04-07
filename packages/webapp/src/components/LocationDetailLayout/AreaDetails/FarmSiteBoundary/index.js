import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { farmSiteBoundaryEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';

export default function PureFarmSiteBoundary({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
}) {
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
  const {
    persistedData: { grid_points, total_area, perimeter },
  } = useHookFormPersist(['/map'], getValues, setValue);

  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const showPerimeter = true;
  const onSubmit = (data) => {
    data[farmSiteBoundaryEnum.total_area_unit] = data[farmSiteBoundaryEnum.total_area_unit].value;
    showPerimeter &&
      (data[farmSiteBoundaryEnum.perimeter_unit] = data[farmSiteBoundaryEnum.perimeter_unit].value);
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'farm_site_boundary',
    };
    submitForm({ formData });
  };

  return (
    <Form
      buttonGroup={<LocationButtons disabled={disabled} />}
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <LocationPageHeader
        title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        history={history}
      />
      <AreaDetails
        name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
        history={history}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        register={register}
        setValue={setValue}
        getValues={getValues}
        watch={watch}
        setError={setError}
        control={control}
        showPerimeter={showPerimeter}
        errors={errors}
        system={system}
        total_area={total_area}
        perimeter={perimeter}
      />
    </Form>
  );
}
