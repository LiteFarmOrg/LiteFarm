import React from 'react';
import ModalComponent from '../ModalComponent/v2'
import { useTranslation } from 'react-i18next';

export default function UnableToRetireModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent 
      title={t('FARM_MAP.UNABLE_TO_RETIRE.TITLE')}
      contents={[t('FARM_MAP.UNABLE_TO_RETIRE.BODY')]}
      dismissModal={dismissModal}
      warning
    />
  );
}
