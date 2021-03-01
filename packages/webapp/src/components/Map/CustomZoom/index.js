import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import styles from './styles.module.scss';  
import { useTranslation } from 'react-i18next';
import VideoLogo from '../../../assets/images/map/video.svg';

export default function CustomZoom({
  onClickZoomIn,
  onClickZoomOut,
}) {
  const { t } = useTranslation();

  return (
    <div
      // className={[styles.container, className].join(' ')}
      // style={style}
    >
      <button onClick={onClickZoomIn}>{"fml"}</button>
      <button onClick={onClickZoomOut}>{"fml 2"}</button>
    </div>
  );
}

CustomZoom.prototype = {
  onClickZoomIn: PropTypes.func,
  onClickZoomOut: PropTypes.func,
};
