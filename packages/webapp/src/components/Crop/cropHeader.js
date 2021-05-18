import React from 'react';
import { Label, Title, Text } from '../Typography';
import { ReactComponent as Back } from '../../assets/images/fieldCrops/back.svg';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
function CropHeader({ crop_translation_key, crop_variety_name, supplierName, onBackClick }) {
  const { t } = useTranslation(['translation', 'crop']);
  const imageKey = crop_translation_key.toLowerCase();

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerTitleContainer} onClick={onBackClick}>
        <Back style={{ verticalAlign: 'text-bottom' }} />
        <Title className={styles.headerTitle}>{t(`crop:${crop_translation_key}`)}</Title>
      </div>
      <div className={styles.headerAttributesContainer}>
        <Label>
          Variety:{' '}
          <Text className={styles.attributeText}>
            {' '}
            {crop_variety_name ?? t(`crop:${crop_translation_key}`)}{' '}
          </Text>
        </Label>
      </div>
      <div className={styles.headerAttributesContainer}>
        <Label>
          Supplier: <Text className={styles.attributeText}> {supplierName} </Text>
        </Label>
      </div>
      <div className={styles.imgContainer}>
        <img src={`crop-images/${imageKey}.jpg`} style={{ borderRadius: '100px' }} />
      </div>
    </div>
  );
}

export default CropHeader;
