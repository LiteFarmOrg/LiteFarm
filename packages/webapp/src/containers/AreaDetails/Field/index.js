import React from 'react';
import { useTranslation } from 'react-i18next';
import PureField from '../../../components/AreaDetailsLayout/Field';

function FarmSiteBoundary() {
  const { t } = useTranslation();
  const onBack = () => {
    console.log('back');
  };

  return (
    <>
      <PureField onGoBack={onBack} />
    </>
  );
}

export default FarmSiteBoundary;
