import PageTitle from '../PageTitle/v2';
import React from 'react';
import {
  setZoomLevelSelector,
  setPositionSelector,
  setZoomLevel,
  setPosition,
} from '../../containers/mapSlice';
import { useSelector, useDispatch } from 'react-redux';

export default function LocationPageHeader({
  history,
  isCreateLocationPage,
  match,
  isViewLocationPage,
  isEditLocationPage,
  title,
}) {
  const onCancel = () => {
    history.push('/map');
  };
  const dispatch = useDispatch();
  const currentZoomLevel = useSelector(setZoomLevelSelector);
  const position = useSelector(setPositionSelector);
  const onGoBack = () => {
    dispatch(setZoomLevel(null));
    dispatch(setPosition(null));
    isCreateLocationPage &&
      history.push({
        pathname: '/map',
        isStepBack: true,
      });
    isViewLocationPage &&
      history.push({
        pathname: '/map',
        cameraInfo: { zoom: currentZoomLevel, location: position },
      });
    isEditLocationPage && history.push(match.url.replace('edit', 'details'));
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
