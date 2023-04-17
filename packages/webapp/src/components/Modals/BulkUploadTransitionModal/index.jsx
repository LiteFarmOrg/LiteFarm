import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function BulkUploadTransitionModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('FARM_MAP.BULK_UPLOAD_TRANSITION.TITLE')}
      contents={[t('FARM_MAP.BULK_UPLOAD_TRANSITION.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} type={'submit'} sm>
            {t('common:OK')}
          </Button>
        </>
      }
    />
  );
}
