import React from 'react';
import { useTranslation } from 'react-i18next';
import PureWaterValve from '../../../components/PointDetails/WaterValve';

function Gate() {
  const { t } = useTranslation();
  const onBack = () => {
    console.log('back');
  };

  return (
    <>
      <PureWaterValve onGoBack={onBack} />
    </>
  );
}

export default Gate;
