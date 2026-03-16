import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import LocationButtons from './LocationButtons';
import LocationPageHeader from './LocationPageHeader';
import Form from '../Form';
import AreaDetails from './AreaDetails/AreaDetails';
import LineDetails from './LineDetails/LineDetails';
import PointDetails from './PointDetails/PointDetails';
import CardLayout from '../Layout/CardLayout';
import LocationRouterTab from './LocationRouterTab';

export function PureLocationDetailLayout({
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const formMethods = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: persistedFormData,
  });
  const historyCancel = () => {
    navigate('/map', { state: { hideLocationPin: true } });
  };

  const onError = (data) => {};
  const disabled = !formMethods.formState.isValid;

  const title =
    (isCreateLocationPage && t(`FARM_MAP.${translationKey}.TITLE`)) ||
    (isEditLocationPage && t(`FARM_MAP.${translationKey}.EDIT_TITLE`)) ||
    (isViewLocationPage && persistedFormData.name);

  // TODO: Move this up to container when just 1 container exists for locations
  const { location_id } = useParams();

  const DetailsComponent =
    locationCategory === 'area'
      ? AreaDetails
      : locationCategory === 'line'
      ? LineDetails
      : PointDetails;

  const detailsProps = {
    name: t(`FARM_MAP.${translationKey}.NAME`),
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
    ...(locationCategory === 'area' ? { system, showPerimeter } : {}),
  };

  return (
    <CardLayout>
      <FormProvider {...formMethods}>
        <Form
          buttonGroup={
            <LocationButtons
              disabled={disabled}
              isCreateLocationPage={isCreateLocationPage}
              isViewLocationPage={isViewLocationPage}
              isEditLocationPage={isEditLocationPage}
              onEdit={() => navigate(`/${locationType}/${location_id}/edit`)}
              onRetire={handleRetire}
              isAdmin={isAdmin}
            />
          }
          onSubmit={formMethods.handleSubmit(onSubmit, onError)}
          fullWidthContent
        >
          <LocationPageHeader
            title={title}
            isCreateLocationPage={isCreateLocationPage}
            isViewLocationPage={isViewLocationPage}
            isEditLocationPage={isEditLocationPage}
            onCancel={historyCancel}
            formMethods={formMethods}
          />
          {isViewLocationPage && location_id && <LocationRouterTab location_id={location_id} />}
          <DetailsComponent {...detailsProps}>{detailsChildren}</DetailsComponent>
        </Form>
      </FormProvider>
    </CardLayout>
  );
}
