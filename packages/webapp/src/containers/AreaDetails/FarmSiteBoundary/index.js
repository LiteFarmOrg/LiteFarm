import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetails/FarmSiteBoundary';

function FarmSiteBoundary() {
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
