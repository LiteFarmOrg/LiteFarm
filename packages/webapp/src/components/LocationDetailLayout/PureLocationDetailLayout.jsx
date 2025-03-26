import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import LocationButtons from './LocationButtons';
import LocationPageHeader from './LocationPageHeader';
import Form from '../Form';
import AreaDetails from './AreaDetails/AreaDetails';
import LineDetails from './LineDetails/LineDetails';
import PointDetails from './PointDetails/PointDetails';
import RouterTab from '../RouterTab';
import useLocationRouterTabs from '../../containers/LocationDetails/useLocationRouterTabs';
import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../containers/locationSlice';
import { Variant } from '../RouterTab/Tab';
import layoutStyles from '../Layout/layout.module.scss';

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
  handleRetire,
  isAdmin,
  onSubmit,
  translationKey,
  detailsChildren,
  showPerimeter,
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
  const { location_id } = match.params;
  // TODO: Move this up to container when just 1 container exists for locations
  const location = useSelector(locationByIdSelector(location_id));
  const routerTabs = isViewLocationPage ? useLocationRouterTabs(location, match) : [];

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
        classNames={isViewLocationPage ? { layout: layoutStyles.paperContainer } : {}}
        hasWhiteBackground={isViewLocationPage}
        classes={
          isViewLocationPage
            ? {
                footer: {
                  padding: '24px 16px 24px 16px',
                  position: 'relative',
                  margin: '0 0 16px 0',
                },
              }
            : {}
        }
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
            variant={Variant.UNDERLINE}
          />
        )}
        {details}
      </Form>
    </FormProvider>
  );
}
