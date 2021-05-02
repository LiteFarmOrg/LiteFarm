import React from 'react';
import ModalComponent from '../ModalComponent/v2'
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function ConfirmRetireModal({ dismissModal, handleRetire }) {
  const { t } = useTranslation();
  return (
    <ModalComponent 
      title={t('FARM_MAP.CONFIRM_RETIRE.TITLE')}
      contents={[t('FARM_MAP.CONFIRM_RETIRE.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} color={'secondary'} type={'button'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button className={styles.button} onClick={handleRetire} type={'submit'} sm>
            {t('common:RETIRE')}
          </Button>
        </>
      }
    />
  );
}
