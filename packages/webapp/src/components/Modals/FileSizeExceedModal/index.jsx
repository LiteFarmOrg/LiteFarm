import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';

export default function FileSizeExceedModal({ dismissModal, handleRetry }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`FILE_SIZE_MODAL.TITLE`)}
      contents={[t('FILE_SIZE_MODAL.BODY')]}
      dismissModal={dismissModal}
      error
    />
  );
}
