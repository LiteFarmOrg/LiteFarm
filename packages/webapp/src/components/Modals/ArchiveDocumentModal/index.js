import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';

import clsx from 'clsx';
import { Title } from '../../Typography';

export default function ArchiveDocumentModal({ dismissModal, onCancel, onContinue }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <ModalComponent
        dismissModal={dismissModal}
        title={t('DOCUMENTS.ARCHIVE_DOCUMENT')}
        buttonGroup={
          <>
            <Button onClick={onCancel} className={styles.button} color="secondary" sm>
              {t('DOCUMENTS.CANCEL')}
            </Button>
            <Button onClick={onContinue} className={styles.button} color="primary" sm>
              {t('DOCUMENTS.ARCHIVE')}
            </Button>
          </>
        }
      >
        <div className={styles.stepList}>{t('DOCUMENTS.ARCHIVE_DOCUMENT_TEXT')}</div>
      </ModalComponent>
    </div>
  );
}
