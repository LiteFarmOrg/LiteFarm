import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../index';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { residenceEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { getPersistPath } from '../../utils';

export default function PureResidence({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    control,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });
  const persistedPath = getPersistPath('residence', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { name, grid_points, total_area, perimeter },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

  const onError = (data) => {};
  const disabled = !isValid || !isDirty;
  const showPerimeter = false;
  const onSubmit = (data) => {
    data[residenceEnum.total_area_unit] = data[residenceEnum.total_area_unit]?.value;

    data[residenceEnum.perimeter_unit] = data[residenceEnum.perimeter_unit]?.value;
    const formData = {
      grid_points,
      total_area,
      perimeter,
      ...data,

      type: 'residence',
    };
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.RESIDENCE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.RESIDENCE.EDIT_TITLE')) ||
    (isViewLocationPage && name);

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/residence/${match.params.location_id}/edit`)}
          onRetire={handleRetire}
          isAdmin={isAdmin}
        />
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <LocationPageHeader
        title={title}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        history={history}
        match={match}
      />
      <AreaDetails
        name={t('FARM_MAP.RESIDENCE.NAME')}
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
