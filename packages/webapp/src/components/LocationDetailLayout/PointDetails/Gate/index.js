import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '../index';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { getPersistPath } from '../../utils';
import { gateEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';

export default function PureGate({
  history,
  match,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  submitForm,
  useHookFormPersist,
  handleRetire,
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
  const persistedPath = getPersistPath('gate', match, {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  });
  const {
    persistedData: { point, type },
  } = useHookFormPersist(persistedPath, getValues, setValue, !!isCreateLocationPage);

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

  const title =
    (isCreateLocationPage && t('FARM_MAP.GATE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.GATE.EDIT_TITLE')) ||
    (isViewLocationPage && getValues(gateEnum.name));

  return (
    <Form
      buttonGroup={
        <LocationButtons
          disabled={disabled}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          onEdit={() => history.push(`/gate/${match.params.location_id}/edit`)}
          onRetire={handleRetire}
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
      <PointDetails
        name={t('FARM_MAP.GATE.NAME')}
        history={history}
        isCreateLocationPage={isCreateLocationPage}
        isViewLocationPage={isViewLocationPage}
        isEditLocationPage={isEditLocationPage}
        setValue={setValue}
        register={register}
        disabled={disabled}
        errors={errors}
      />
    </Form>
  );
}
