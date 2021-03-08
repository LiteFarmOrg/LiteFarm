import React from 'react';
import { useTranslation } from 'react-i18next';
import PureAreaDetails from '..//AreaDetails';

export default function PureFarmSiteBoundary({ title, name }) {
  const { t } = useTranslation();
  const onBack = () => {
    console.log('back');
  };

  return (
    <div>
      <PureAreaDetails
        title={'Add farm site boundary'}
        onBack={onBack}
        name={'Farm site boundary name'}
      />
    </div>
  );
}
