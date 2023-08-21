import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import ModalComponent from '../ModalComponent/v2';

export default function RetireCustomTaskModal({ dismissModal, onRetire }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.RETIRE_CUSTOM_TASK')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onRetire}>{t('common:RETIRE')}</Button>
        </>
      }
      contents={[t('ADD_TASK.RETIRE_CUSTOM_TASK_CONTENT')]}
    />
  );
}
