import React from 'react';
import { Label, Text, Title } from '../Typography';
import { ReactComponent as Back } from '../../assets/images/managementPlans/back.svg';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import clsx from 'clsx';

function CropHeader({ variety, onBackClick }) {
  const { t } = useTranslation(['translation', 'crop']);
  const {
    crop_variety_name,
    crop_genus,
    crop_specie,
    crop_varietal,
    crop_cultivar,
    supplier,
    crop_variety_photo_url,
    crop_translation_key,
  } = variety;

  const crop_scientific_name = () => {
    const genus = crop_genus
      ? crop_genus.charAt(0).toUpperCase() + crop_genus.slice(1).toLowerCase() + ' '
      : '';
    const species = crop_specie ? crop_specie : '';
    return `${genus}${species}`;
  };

  const varietalDetails = () => {
    const varietal = crop_varietal ? `var. ${crop_varietal.toLowerCase()} ` : '';
    const cultivar = crop_cultivar ? `'${crop_cultivar}'` : '';
    return `${varietal}${cultivar}`;
  };

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
            {crop_scientific_name()}
          </Label>
        </div>
        <div className={styles.headerAttributesContainer}>
          <Label className={clsx(styles.textOverFlowBehaviour, styles.italicText)}>
            {varietalDetails()}
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
        <img
          src={crop_variety_photo_url}
          style={{ borderRadius: '100px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/crop-images/default.jpg';
          }}
        />
      </div>
    </div>
  );
}

export default CropHeader;
