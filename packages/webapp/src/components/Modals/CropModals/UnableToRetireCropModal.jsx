import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';

export default function UnableToRetireModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('CROP_VARIETIES.RETIRE.UNABLE_TO_RETIRE_TITLE')}
      contents={[ t('CROP_VARIETIES.RETIRE.UNABLE_TO_RETIRE') ]}
      dismissModal={dismissModal}
      error
    />
  );
}