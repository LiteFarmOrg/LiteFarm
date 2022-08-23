import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function CancelFlowModal({ dismissModal, handleCancel, flow }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`CANCEL_FLOW_MODAL.TITLE`, { flow })}
      contents={[t('CANCEL_FLOW_MODAL.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} color={'secondary'} sm>
            {t('common:NO')}
          </Button>
          <Button data-cy="cancelFlow-yes" className={styles.button} onClick={handleCancel} sm>
            {t('common:YES')}
          </Button>
        </>
      }
      warning
    />
  );
}
