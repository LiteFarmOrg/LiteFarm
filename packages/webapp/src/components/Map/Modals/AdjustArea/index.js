import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapTutorialModal from '../../../Modals/MapTutorialModal';
import PropTypes from 'prop-types';
import { ReactComponent as AdjustAreaImg } from '../../../../assets/images/map/adjustArea.svg';
import styles from './styles.module.scss';

export default function AdjustAreaModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <MapTutorialModal
      title={t('FARM_MAP.TUTORIAL.ADJUST.TITLE')}
      dismissModal={dismissModal}
    >
      <div className={styles.imageContainer}>
        <AdjustAreaImg className={styles.image} />
      </div>
      <div className={styles.instruction}>{t('FARM_MAP.TUTORIAL.ADJUST.TEXT')}</div>
    </MapTutorialModal>
  );
}

AdjustAreaModal.prototype = {
  dismissModal: PropTypes.func,
};
