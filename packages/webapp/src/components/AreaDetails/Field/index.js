import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '..';

export default function PureField({ onGoBack }) {
  const { t } = useTranslation();

  return (
    <div>
      <AreaDetails
        title={t('FARM_MAP.FIELD.TITLE')}
        name={t('FARM_MAP.FIELD.NAME')}
        onBack={onGoBack}
      />
    </div>
  );
}
