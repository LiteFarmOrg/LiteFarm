import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';  
import { useTranslation } from 'react-i18next';
import VideoLogo from '../../../assets/images/map/video.svg';

export default function PureMapHeader({
  className,
  style,
  farmName,
  showVideo,
}) {
  const { t } = useTranslation();

  return (
    <div
      className={[styles.container, className].join(' ')}
      style={style}
    >
      <div className={styles.headerText}>
        <span className={styles.farmName}>{farmName}</span>
        {" | "}
        <span className={styles.farmMap}>{t('FARM_MAP.TITLE')}</span>
      </div>
      <input
        type="image"
        src={VideoLogo}
        className={styles.button}
        onClick={() => showVideo()}
      />
    </div>
  );
}

PureMapHeader.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  farmName: PropTypes.string,
  showVideo: PropTypes.func,
};
