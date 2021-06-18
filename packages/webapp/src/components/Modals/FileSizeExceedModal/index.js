import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function FileSizeExceedModal({ dismissModal, handleRetry }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`FILE_SIZE_MODAL.TITLE`)}
      contents={[t('FILE_SIZE_MODAL.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button className={styles.button} onClick={handleRetry} sm>
            {t('common:RETRY')}
          </Button>
        </>
      }
      error
    />
    //<File/>
  );
}

const styles1 = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
  display: 'flex',
};

export function File({ }) {
  return (
    <div style={styles1}>
      <label className="custom-file-upload">
        <input type="file" multiple />
        <i className="fa fa-cloud-upload" /> Attach
        </label>
    </div>
  );
};