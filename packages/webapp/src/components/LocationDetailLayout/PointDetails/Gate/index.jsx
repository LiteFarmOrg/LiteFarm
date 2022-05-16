import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '../PointDetails';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';

export default function PureGateWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureGate {...props} />
    </PersistedFormWrapper>
  );
}
export function PureGate({
  history,
  match,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  submitForm,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    setValue,
    register,
    getValues,

    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });

  const { historyCancel } = useHookFormPersist?.(getValues) || {};

  const disabled = !isValid;

  const onError = (data) => {};
  const onSubmit = (data) => {
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
    });
    submitForm({ formData });
  };

  const title =
    (isCreateLocationPage && t('FARM_MAP.GATE.TITLE')) ||
    (isEditLocationPage && t('FARM_MAP.GATE.EDIT_TITLE')) ||
    (isViewLocationPage && persistedFormData.name);

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
