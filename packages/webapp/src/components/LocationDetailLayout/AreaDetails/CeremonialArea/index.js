import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../../ButtonGroup/LocationButtons';
import { ceremonialEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import PageTitle from '../../../PageTitle/v2';

export default function PureCeremonialArea({
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
    data[ceremonialEnum.total_area_unit] = data[ceremonialEnum.total_area_unit].value;
    showPerimeter &&
      (data[ceremonialEnum.perimeter_unit] = data[ceremonialEnum.perimeter_unit].value);
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,
      type: 'ceremonial_area',
    };
    submitForm({ formData });
  };

  const onCancel = () => {
    history.push('/map');
  };

  const onGoBack = () => {
    isCreateLocationPage &&
      history.push({
        pathname: '/map',
        isStepBack: true,
      });
  };

  return (
    <Form
      buttonGroup={<LocationButtons disabled={disabled} />}
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <PageTitle
        title={t('FARM_MAP.CEREMONIAL_AREA.TITLE')}
        onCancel={onCancel}
        onGoBack={onGoBack}
        style={{ marginBottom: '24px' }}
      />
      <AreaDetails
        name={t('FARM_MAP.CEREMONIAL_AREA.NAME')}
        history={history}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        register={register}
        handleSubmit={handleSubmit}
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
