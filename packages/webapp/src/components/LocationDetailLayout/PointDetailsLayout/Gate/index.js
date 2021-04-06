import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetailsLayout from '../index';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../../ButtonGroup/LocationButtons';
import { useLocationPageType } from '../../../../containers/LocationDetails/utils';

export default function PureGate({
  history,
  match,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  submitForm,
  useHookFormPersist,
}) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    setValue,
    register,
    errors,
    getValues,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const {
    persistedData: { point, type },
  } = useHookFormPersist(['/map'], getValues, setValue);

  const disabled = !isValid || !isDirty;

  const onError = (data) => {};
  const onSubmit = (data) => {
    const formData = {
      type,
      point,
      ...data,
    };
    submitForm({ formData });
  };

  return (
    <PointDetailsLayout
      name={t('FARM_MAP.GATE.NAME')}
      title={t('FARM_MAP.GATE.TITLE')}
      history={history}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
      submitForm={onSubmit}
      onError={onError}
      handleSubmit={handleSubmit}
      setValue={setValue}
      register={register}
      disabled={disabled}
      errors={errors}
      buttonGroup={<LocationButtons disabled={disabled} />}
    />
  );
}
