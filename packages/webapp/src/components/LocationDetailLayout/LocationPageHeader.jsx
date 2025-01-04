import PageTitle from '../PageTitle/v2';
import {
  setPosition,
  setPositionSelector,
  setZoomLevel,
  setZoomLevelSelector,
} from '../../containers/mapSlice';
import { upsertFormData } from '../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function LocationPageHeader({
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  title,
  onCancel,
  formMethods,
}) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentZoomLevel = useSelector(setZoomLevelSelector);
  const position = useSelector(setPositionSelector);
  const onGoBack = () => {
    dispatch(setZoomLevel(null));
    dispatch(setPosition(null));
    if (isCreateLocationPage) {
      dispatch(upsertFormData(formMethods.getValues()));
      navigate('/map', { replace: true, state: { isStepBack: true, hideLocationPin: true } });
    }
    isViewLocationPage &&
      navigate('/map', {
        replace: true,
        state: { cameraInfo: { zoom: currentZoomLevel, location: position } },
      });
    isEditLocationPage && navigate(-1);
  };
  return (
    <PageTitle
      title={title}
      onCancel={isCreateLocationPage && onCancel}
      cancelModalTitle={t('FARM_MAP.LOCATION_CREATION_FLOW')}
      onGoBack={onGoBack}
      style={{ marginBottom: '24px' }}
    />
  );
}
