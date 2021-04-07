import PageTitle from '../PageTitle/v2';
import React from 'react';

export default function LocationPageHeader({
  history,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  title,
}) {
  const onCancel = () => {
    history.push('/map');
  };

  const onGoBack = () => {
    isCreateLocationPage &&
      history.push({
        pathname: '/map',
        isStepBack: true,
      });
  };
  return (
    <PageTitle
      title={title}
      onCancel={onCancel}
      onGoBack={onGoBack}
      style={{ marginBottom: '24px' }}
    />
  );
}
