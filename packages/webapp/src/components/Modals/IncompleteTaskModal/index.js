import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';

export default function IncompleteTaskModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('MANAGEMENT_PLAN.INCOMPLETE_TASK_TITLE')}
      error
      buttonGroup={
        <Button onClick={dismissModal} sm>
          {t('common:BACK')}
        </Button>
      }
      contents={[t('MANAGEMENT_PLAN.INCOMPLETE_TASK_CONTENT')]}
    />
  );
}
