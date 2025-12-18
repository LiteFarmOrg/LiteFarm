import PageTitle from '../PageTitle/v2';
import { useNavigate } from 'react-router-dom';
import {
  setPosition,
  setPositionSelector,
  setZoomLevel,
  setZoomLevelSelector,
} from '../../containers/mapSlice';
import { upsertFormData } from '../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function LocationPageHeader({
  history,
  isCreateLocationPage,
  match,
  isViewLocationPage,
  isEditLocationPage,
  title,
  onCancel,
  formMethods,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentZoomLevel = useSelector(setZoomLevelSelector);
  const position = useSelector(setPositionSelector);
  const onGoBack = () => {
    dispatch(setZoomLevel(null));
    dispatch(setPosition(null));
    if (isCreateLocationPage) {
      dispatch(upsertFormData(formMethods.getValues()));
      history.replace('/map', { isStepBack: true, hideLocationPin: true });
    }
    isViewLocationPage &&
      history.replace('/map', { cameraInfo: { zoom: currentZoomLevel, location: position } });
    isEditLocationPage && navigate(-1);
  };
  return (
    <PageTitle
      title={title}
      onCancel={isCreateLocationPage && onCancel}
      onGoBack={onGoBack}
      style={{ marginBottom: '24px' }}
    />
  );
}
