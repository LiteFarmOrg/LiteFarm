import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../';
import { ReactComponent as AdjustAreaImg } from '../../../assets/images/map/adjustArea.svg';
import styles from './styles.module.scss';

export default function AdjustModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <div className={styles.instruction}>{t('FARM_MAP.ADJUST_MODAL.TEXT')}</div>
        <AdjustAreaImg className={styles.image} />
      </div>
    </Modal>
  );
}
