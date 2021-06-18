import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';

export default function ArchiveDocumentModal() {
  const { t } = useTranslation();
  const [showArchiveDocumentModal, setShowArchiveDocumentModal] = useState(true);

  return (
    <div className={styles.container}>
      {showArchiveDocumentModal && (
        <ModalComponent
          dismissModal={() => setShowArchiveDocumentModal(false)}
          title={t('DOCUMENTS.ARCHIVE_DOCUMENT')}
          buttonGroup={
            <>
              {showArchiveDocumentModal && (
                <Button
                  onClick={() => setShowArchiveDocumentModal(false)}
                  className={styles.button}
                  color="secondary"
                  sm
                >
                  {t('DOCUMENTS.CANCEL')}
                </Button>
              )}

              <Button onClick={() => {}} className={styles.button} color="primary" sm>
                {t('DOCUMENTS.ARCHIVE')}
              </Button>
            </>
          }
        >
          <div className={styles.stepList}>{t('DOCUMENTS.ARCHIVE_DOCUMENT_TEXT')}</div>
        </ModalComponent>
      )}
    </div>
  );
}
