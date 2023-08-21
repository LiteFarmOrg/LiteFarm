import PageTitle from '../PageTitle/v2';
import React from 'react';
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
    isEditLocationPage && history.back();
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
