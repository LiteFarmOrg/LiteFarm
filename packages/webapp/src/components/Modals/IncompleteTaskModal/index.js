import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';

export default function IncompleteTaskModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('MANAGEMENT_PLAN.INCOMPLETE_TASK_TITLE')}
      error
      contents={[t('MANAGEMENT_PLAN.INCOMPLETE_TASK_CONTENT')]}
    />
  );
}
