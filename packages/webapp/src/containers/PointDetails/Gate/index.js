import React from 'react';
import { useTranslation } from 'react-i18next';
import PureGate from '../../../components/PointDetails/Gate';

function Gate() {
  const { t } = useTranslation();
  const onBack = () => {
    console.log('back');
  };

  return (
    <>
      <PureGate onGoBack={onBack} />
    </>
  );
}

export default Gate;
