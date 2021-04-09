import PageTitle from '../PageTitle/v2';
import React from 'react';

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

  const onGoBack = () => {
    isCreateLocationPage &&
      history.push({
        pathname: '/map',
        isStepBack: true,
      });
    isViewLocationPage && history.push('/map');
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
