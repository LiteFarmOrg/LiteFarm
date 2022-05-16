import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { ceremonialEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureCeremonialAreaWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureCeremonialArea {...props} />
    </PersistedFormWrapper>
  );
}

export function PureCeremonialArea({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
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
    defaultValues: persistedFormData,
  });

  const { historyCancel } = useHookFormPersist?.(getValues) || {};

  const onError = (data) => {};
  const disabled = !isValid;
  const showPerimeter = true;
  const onSubmit = (data) => {
    data[ceremonialEnum.total_area_unit] = data[ceremonialEnum.total_area_unit]?.value;
    data[ceremonialEnum.perimeter_unit] = data[ceremonialEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'ceremonial_area',
    });
    submitForm({ formData });
  };
  const title =
    (isCreateLocationPage && t('FARM_MAP.CEREMONIAL_AREA.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.CEREMONIAL_AREA.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);
  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/ceremonial_area/${match.params.location_id}/edit`)}
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
        onCancel={historyCancel}
      />
      <AreaDetails
        name={t('FARM_MAP.CEREMONIAL_AREA.NAME')}
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
      />
    </Form>
  );
}
