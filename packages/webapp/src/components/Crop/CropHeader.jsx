import React from 'react';
import { Label, Text, Title } from '../Typography';
import { ReactComponent as Back } from '../../assets/images/managementPlans/back.svg';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import clsx from 'clsx';

function CropHeader({
  crop_translation_key,
  crop_variety_name,
  crop_scientific_name,
  crop_cultivar,
  supplier,
  crop_variety_photo_url,
  onBackClick,
}) {
  const { t } = useTranslation(['translation', 'crop']);
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerInfoWrapper}>
        <div className={styles.headerTitleContainer} onClick={onBackClick}>
          <Back style={{ verticalAlign: 'text-bottom', marginBottom: '20px' }} />
          <Title className={clsx(styles.headerTitle, styles.textOverFlowBehaviour)}>
            {t(`crop:${crop_translation_key}`)}
          </Title>
        </div>
        <div className={styles.headerAttributesContainer}>
          <Label className={clsx(styles.textOverFlowBehaviour, styles.italicText)}>
            {crop_scientific_name}
          </Label>
        </div>
        <div className={styles.headerAttributesContainer}>
          <Label className={clsx(styles.textOverFlowBehaviour, styles.italicText)}>
            var. {crop_variety_name.toLowerCase() + " '" + crop_cultivar + "'"}
          </Label>
        </div>
        <div className={clsx(styles.headerAttributesContainer, styles.supplierContainer)}>
          <Label className={styles.textOverFlowBehaviour}>
            {t('MANAGEMENT_PLAN.SUPPLIER')}:{' '}
            <Text className={styles.attributeText}> {supplier} </Text>
          </Label>
        </div>
      </div>
      <div className={styles.imgContainer}>
        <img src={crop_variety_photo_url} style={{ borderRadius: '100px' }} />
      </div>
    </div>
  );
}

export default CropHeader;
