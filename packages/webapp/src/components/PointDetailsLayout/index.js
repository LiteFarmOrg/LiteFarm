import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';

export default function PointDetailsLayout({ name, children, setValue }) {
  const { t } = useTranslation();

  return (
    <div>
      <Input
        label={name + ' name'}
        type="text"
        optional
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
      />

      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
      />
    </div>
  );
}
