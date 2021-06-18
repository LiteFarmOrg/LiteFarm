import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import styles from './styles.module.scss';
import Button from '../../Form/Button';

import clsx from 'clsx';
import { Title } from '../../Typography';

export default function ArchiveDocumentModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal} title={t('DOCUMENTS.ARCHIVE_DOCUMENT')}>
      <div className={styles.container}>
        <Title className={styles.title}>{t('DOCUMENTS.ARCHIVE_DOCUMENT')}</Title>
        <div className={styles.stepList}>{t('DOCUMENTS.ARCHIVE_DOCUMENT_TEXT')}</div>

        <>
          <Button className={styles.button} color="secondary" sm>
            {t('DOCUMENTS.CANCEL')}
          </Button>
          <Button className={styles.button} color="primary" sm>
            {t('DOCUMENTS.ARCHIVE')}
          </Button>
        </>
      </div>
    </Modal>
  );
}
