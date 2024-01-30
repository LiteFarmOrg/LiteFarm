import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import RadioGroup from '../../Form/RadioGroup';
import styles from './styles.module.scss';
import Individual from '../../../assets/images/plantingMethod/Individual.svg';
import Rows from '../../../assets/images/plantingMethod/Rows.svg';

import Beds from '../../../assets/images/plantingMethod/Beds.svg';
import Monocrop from '../../../assets/images/plantingMethod/Monocrop.svg';
import { DO_CDN_URL } from '../../../util/constants';
import ImageModal from '../../Modals/ImageModal';

const BROADCAST = 'BROADCAST_METHOD';
const CONTAINER = 'CONTAINER_METHOD';
const BEDS = 'BED_METHOD';
const ROWS = 'ROW_METHOD';
const images = {
  [BROADCAST]: [
    `${DO_CDN_URL}/planting_method/Broadcast_1.webp`,
    `${DO_CDN_URL}/planting_method/Broadcast_2.webp`,
    `${DO_CDN_URL}/planting_method/Broadcast_3.webp`,
  ],
  [CONTAINER]: [
    `${DO_CDN_URL}/planting_method/Individual_1.webp`,
    `${DO_CDN_URL}/planting_method/Individual_2.webp`,
    `${DO_CDN_URL}/planting_method/Individual_3.webp`,
  ],
  [BEDS]: [
    `${DO_CDN_URL}/planting_method/Bed_1.webp`,
    `${DO_CDN_URL}/planting_method/Bed_2.webp`,
    `${DO_CDN_URL}/planting_method/Bed_3.webp`,
  ],
  [ROWS]: [
    `${DO_CDN_URL}/planting_method/Rows_1.webp`,
    `${DO_CDN_URL}/planting_method/Rows_2.webp`,
    `${DO_CDN_URL}/planting_method/Rows_3.webp`,
  ],
};

export function PurePlantingMethod({
  showBroadcast,
  planting_method,
  PLANTING_METHOD,
  control,
  title,
}) {
  const { t } = useTranslation();

  const [{ imageModalSrc, imageModalAlt }, setSelectedImage] = useState({});
  const onImageSelect = (src, alt) => setSelectedImage({ imageModalSrc: src, imageModalAlt: alt });
  const dismissModal = () => setSelectedImage({});

  return (
    <>
      <Main
        style={{ marginBottom: '24px' }}
        tooltipContent={t('MANAGEMENT_PLAN.PLANTING_METHOD_TOOLTIP')}
      >
        {title}
      </Main>
      <div className={styles.radioGroupContainer}>
        <RadioGroup
          data-cy="cropPlan-plantingMethod"
          hookFormControl={control}
          name={PLANTING_METHOD}
          radios={[
            {
              label: t('MANAGEMENT_PLAN.ROWS'),
              value: ROWS,
            },
            { label: t('MANAGEMENT_PLAN.BEDS'), value: BEDS },
            {
              label: t('MANAGEMENT_PLAN.INDIVIDUAL_CONTAINER'),
              value: CONTAINER,
            },
            ...(showBroadcast ? [{ label: t('MANAGEMENT_PLAN.BROADCAST'), value: BROADCAST }] : []),
          ]}
          required
        />
        <div className={styles.radioIconsContainer}>
          <Rows />
          <Beds />
          <Individual />
          {showBroadcast && <Monocrop />}
        </div>
      </div>
      {planting_method && (
        <div className={styles.imageGrid}>
          {images[planting_method].map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${planting_method}${index}`}
              onClick={() => onImageSelect(url, planting_method)}
            />
          ))}
        </div>
      )}
      {imageModalSrc && (
        <ImageModal src={imageModalSrc} alt={imageModalAlt} dismissModal={dismissModal} />
      )}
    </>
  );
}

PurePlantingMethod.prototype = {
  showBroadcast: PropTypes.bool,
  planting_method: PropTypes.string,
  PLANTING_METHOD: PropTypes.string,
  control: PropTypes.any,
  plantingMethodPrefix: PropTypes.string,
};
