import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { Label } from '../Typography';
import LocationButtons from './LocationButtons';
import LocationPageHeader from './LocationPageHeader';
import Form from '../Form';
import AreaDetails from './AreaDetails/AreaDetails';

import RadioGroup from '../Form/RadioGroup';
// import AreaDetails from "./AreaDetails/AreaDetails";

export function PureLocationDetailLayout({
  history,
  match,
  system,
  locationType,
  locationCategory,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
  onSubmit,
  translationKey,
  detailsChildren,
}) {
  const { t } = useTranslation();
  const formMethods = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });
  const { historyCancel } = useHookFormPersist?.(formMethods.getValues) || {};
  const onError = (data) => {};
  const disabled = !formMethods.formState.isValid;
  const showPerimeter = false;

  const title =
    (isCreateLocationPage && t(`FARM_MAP.${translationKey}.TITLE`)) ||
    (isEditLocationPage && t(`FARM_MAP.${translationKey}.EDIT_TITLE`)) ||
    (isViewLocationPage && persistedFormData.name);

  const details = useMemo(() => {
    if (locationCategory === 'area') {
      return (
        <AreaDetails
          name={t(`FARM_MAP.${translationKey}.NAME`)}
          history={history}
          isCreateLocationPage={isCreateLocationPage}
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          system={system}
          showPerimeter={showPerimeter}
        >
          {detailsChildren}
        </AreaDetails>
      );
    }
  }, [locationCategory]);

  return (
    <FormProvider {...formMethods}>
      <Form
        buttonGroup={
          <LocationButtons
            disabled={disabled}
            isCreateLocationPage={isCreateLocationPage}
            isViewLocationPage={isViewLocationPage}
            isEditLocationPage={isEditLocationPage}
            onEdit={() => history.push(`/${locationType}/${match.params.location_id}/edit`)}
            onRetire={handleRetire}
            isAdmin={isAdmin}
          />
        }
        onSubmit={formMethods.handleSubmit(onSubmit, onError)}
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
        {details}
      </Form>
    </FormProvider>
  );
}
