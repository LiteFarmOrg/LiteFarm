import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Email from '../../../assets/images/export/email/Email.svg';

export default function PreparingExportModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('PREPARING_EXPORT.TITLE')}
      icon={<Email styles={styles.icon} />}
    >
      <div className={styles.message}> {t('PREPARING_EXPORT.MESSAGE')} </div>
    </ModalComponent>
  );
}
