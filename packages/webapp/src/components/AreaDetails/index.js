import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';

export default function AreaDetails({ name, children }) {
  const { t } = useTranslation();

  return (
    <div>
      <Input label={name} type="text" optional style={{ marginBottom: '30px' }} />
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="text"
          style={{ marginBottom: '30px', width: '50%', float: 'left' }}
        />
        <Input
          label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
          type="text"
          style={{ marginBottom: '30px', width: '50%', paddingLeft: '10px' }}
        />
      </div>
      {children}
      <Input
        label={t('FARM_MAP.AREA_DETAILS.NOTES')}
        type="text"
        optional
        style={{ marginBottom: '30px' }}
      />
    </div>
  );
}
