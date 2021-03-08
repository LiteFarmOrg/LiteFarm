import React from 'react';
import { useTranslation } from 'react-i18next';
import PureFarmSiteBoundary from '../../components/FarmSiteBoundary';

function FarmSiteBoundary() {
  const { t } = useTranslation();
  const onBack = () => {
    console.log('back');
  };

  return (
    <>
      <PureFarmSiteBoundary onGoBack={onBack} />
    </>
  );
}

export default FarmSiteBoundary;
