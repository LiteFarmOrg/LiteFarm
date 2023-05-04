import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { Label } from '../Typography';
import LocationButtons from './LocationButtons';
import LocationPageHeader from './LocationPageHeader';
import Form from '../Form';
import AreaDetails from './AreaDetails/AreaDetails';
import LineDetails from './LineDetails/LineDetails';
import PointDetails from './PointDetails/PointDetails';
import RouterTab from '../RouterTab';

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
  showPerimeter,
  tabs,
}) {
  const { t } = useTranslation();
  const formMethods = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });
  const historyCancel = () => {
    history.push('/map', { hideLocationPin: true });
  };

  const onError = (data) => {};
  const disabled = !formMethods.formState.isValid;

  const title =
    (isCreateLocationPage && t(`FARM_MAP.${translationKey}.TITLE`)) ||
    (isEditLocationPage && t(`FARM_MAP.${translationKey}.EDIT_TITLE`)) ||
    (isViewLocationPage && persistedFormData.name);

  const routerTabs = tabs.map((tab) => ({
    label: t(`FARM_MAP.TAB.${tab.toUpperCase()}`),
    path: `/${locationType}/${match.params.location_id}/${tab}`,
  }));

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
          {detailsChildren && detailsChildren}
        </AreaDetails>
      );
    } else if (locationCategory === 'line') {
      return (
        <LineDetails
          name={t(`FARM_MAP.${translationKey}.NAME`)}
          history={history}
          isCreateLocationPage={isCreateLocationPage}
          isEditLocationPage={isEditLocationPage}
          isViewLocationPage={isViewLocationPage}
        >
          {detailsChildren && detailsChildren}
        </LineDetails>
      );
    } else if (locationCategory === 'point') {
      return (
        <PointDetails
          name={t(`FARM_MAP.${translationKey}.NAME`)}
          history={history}
          isCreateLocationPage={isCreateLocationPage}
          isEditLocationPage={isEditLocationPage}
          isViewLocationPage={isViewLocationPage}
        >
          {detailsChildren && detailsChildren}
        </PointDetails>
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
          formMethods={formMethods}
        />
        {isViewLocationPage && (
          <RouterTab
            classes={{ container: { margin: '6px 0 26px 0' } }}
            history={history}
            match={match}
            tabs={routerTabs}
          />
        )}
        {details}
      </Form>
    </FormProvider>
  );
}
