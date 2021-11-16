import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SubmitButton({ disabled }) {
  const { t } = useTranslation();
  return (
    <Button type={'submit'} disabled={disabled} fullLength>
      {t('common:SAVE')}
    </Button>
  );
}
