import React from 'react';
import { Label, Text, Title } from '../Typography';
import { ReactComponent as Back } from '../../assets/images/managementPlans/back.svg';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

function CropHeader({
  crop_translation_key,
  crop_variety_name,
  supplier,
  crop_variety_photo_url,
  onBackClick,
}) {
  const { t } = useTranslation(['translation', 'crop']);
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerTitleContainer} onClick={onBackClick}>
        <Back style={{ verticalAlign: 'text-bottom', marginBottom: '20px' }} />
        <Title className={styles.headerTitle}>{t(`crop:${crop_translation_key}`)}</Title>
      </div>
      <div className={styles.headerAttributesContainer}>
        <Label>
          {t('MANAGEMENT_PLAN.VARIETY')}:{' '}
          <Text className={styles.attributeText}>
            {' '}
            {crop_variety_name ?? t(`crop:${crop_translation_key}`)}{' '}
          </Text>
        </Label>
      </div>
      <div className={styles.headerAttributesContainer}>
        <Label>
          {t('MANAGEMENT_PLAN.SUPPLIER')}:{' '}
          <Text className={styles.attributeText}> {supplier} </Text>
        </Label>
      </div>
      <div className={styles.imgContainer}>
        <img src={crop_variety_photo_url} style={{ borderRadius: '100px' }} />
      </div>
    </div>
  );
}

export default CropHeader;
