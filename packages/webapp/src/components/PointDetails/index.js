import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';

export default function AreaDetails({ name, children }) {
  const { t } = useTranslation();

  return (
    <div>
      <Input label={name} type="text" optional style={{ marginBottom: '30px' }} />

      {children}
      <Input label={t('common:NOTES')} type="text" optional style={{ marginBottom: '30px' }} />
    </div>
  );
}
