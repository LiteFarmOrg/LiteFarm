import styles from './styles.module.scss';
import OutroImg from '../../assets/images/farm-switch-outro/outro.svg';
import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FarmSwitchPureOutroSplash({ onFinish, farm_name }) {
  //TODO move selector to container
  const { t } = useTranslation();
  const descriptionTop = t('SWITCH_OUTRO.DESCRIPTION_TOP');
  const descriptionBottom = t('SWITCH_OUTRO.DESCRIPTION_BOTTOM');

  return (
    <div className={styles.outroContainer}>
      <div className={styles.bodyContainer}>
        <div className={styles.title}>{t('SWITCH_OUTRO.TITLE')}</div>
        <div className={styles.imgContainer}>
          <OutroImg />
        </div>

        <div className={styles.descriptionTop}>{descriptionTop}</div>
        <div className={styles.descriptionBottom}>{descriptionBottom}</div>
        <div className={styles.bold}>{farm_name}</div>
      </div>
      <Button className={styles.bottomContainer} onClick={onFinish}>
        {t('SWITCH_OUTRO.BUTTON')}
      </Button>
    </div>
  );
}
