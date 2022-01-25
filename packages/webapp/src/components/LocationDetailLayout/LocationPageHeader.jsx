import PageTitle from '../PageTitle/v2';
import React from 'react';
import { setPosition, setPositionSelector, setZoomLevel, setZoomLevelSelector } from '../../containers/mapSlice';
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
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentZoomLevel = useSelector(setZoomLevelSelector);
  const position = useSelector(setPositionSelector);
  const onGoBack = () => {
    dispatch(setZoomLevel(null));
    dispatch(setPosition(null));
    isCreateLocationPage &&
      history.replace({
        pathname: '/map',
        isStepBack: true,
      });
    isViewLocationPage &&
      history.replace({
        pathname: '/map',
        cameraInfo: { zoom: currentZoomLevel, location: position },
      });
    isEditLocationPage && history.goBack();
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
