import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';

export default function AreaDetails({
  name,
  children,
  AREAFIELD,
  areaInputRegister,
  PERIMETERFIELD,
  perimeterInputRegister,
}) {
  const { t } = useTranslation();

  return (
    <div>
      <Input label={name + ' name'} type="text" optional style={{ marginBottom: '40px' }} />
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', float: 'left' }}
          name={AREAFIELD}
          inputRef={areaInputRegister}
        />
        <Input
          label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', paddingLeft: '10px' }}
          name={PERIMETERFIELD}
          inputRef={perimeterInputRegister}
        />
      </div>
      {children}
      <Input label={t('common:NOTES')} type="text" optional style={{ marginBottom: '40px' }} />
    </div>
  );
}
