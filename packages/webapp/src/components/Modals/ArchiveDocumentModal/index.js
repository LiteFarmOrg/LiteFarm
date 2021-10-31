import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';

export default function ArchiveDocumentModal({ onArchive, dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('DOCUMENTS.ARCHIVE_DOCUMENT')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('DOCUMENTS.CANCEL')}
          </Button>

          <Button onClick={onArchive} className={styles.button} color="primary" sm>
            {t('DOCUMENTS.ARCHIVE')}
          </Button>
        </>
      }
    >
      <div className={styles.stepList}>{t('DOCUMENTS.ARCHIVE_DOCUMENT_TEXT')}</div>
    </ModalComponent>
  );
}
