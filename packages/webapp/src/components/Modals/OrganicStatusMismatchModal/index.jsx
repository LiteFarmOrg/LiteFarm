import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function OrganicStatusMismatchModal({ modalContent, dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={modalContent?.title ?? ''}
      contents={[modalContent?.subTitle ?? '']}
      dismissModal={() => dismissModal(0)}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={() => dismissModal(1)} type={'submit'} sm>
            {t('common:GO_BACK')}
          </Button>
          <Button className={styles.button} onClick={() => dismissModal(0)} type={'submit'} sm>
            {t('common:THATS_FINE')}
          </Button>
        </>
      }
    />
  );
}
