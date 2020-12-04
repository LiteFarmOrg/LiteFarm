import styles from './styles.scss';
import OutroImg from '../../assets/images/farm-switch-outro/outro.svg';
import Button from '../Form/Button';
import React from 'react';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import { useTranslation } from 'react-i18next';

export default function FarmSwitchPureOutroSplash({ onFinish }) {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const newFarm = userFarm.farm_name;
  const descriptionTop = t('SWITCH_OUTRO.DESCRIPTION_TOP');
  const descriptionBottom = t('SWITCH_OUTRO.DESCRIPTION_BOTTOM');

  return (
    <div className={styles.outroContainer}>
      <div className={styles.title}>{t('SWITCH_OUTRO.TITLE')}</div>
      <div className={styles.imgContainer}>
        <img src={OutroImg} />
      </div>

      <div className={styles.descriptionTop}>{descriptionTop}</div>
      <div className={styles.descriptionBottom}>{descriptionBottom}</div>
      <div className={styles.bold}>{newFarm}</div>
      <Button
        className={styles.bottomContainer}
        children={t('SWITCH_OUTRO.BUTTON')}
        onClick={onFinish}
      />
    </div>
  );
}
