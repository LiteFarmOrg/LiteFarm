import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '..';

export default function PureFarmSiteBoundary({ onGoBack }) {
  const { t } = useTranslation();

  return (
    <AreaDetails
      title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
      name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
      onBack={onGoBack}
    />
  );
}
