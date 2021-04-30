import React from 'react';
import ModalComponent from '../ModalComponent/v2'
import { useTranslation } from 'react-i18next';

export default function UnableToRetireModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent 
      title={t('INTRODUCE_MAP.TITLE')}
      contents={[t('INTRODUCE_MAP.BODY')]}
      dismissModal={dismissModal}
    />
  );
}
