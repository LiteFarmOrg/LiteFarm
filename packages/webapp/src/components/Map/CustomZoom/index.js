import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as ZoomInLogo } from '../../../assets/images/map/zoomIn.svg';
import { ReactComponent as ZoomOutLogo } from '../../../assets/images/map/zoomOut.svg';

export default function CustomZoom({ className, style, onClickZoomIn, onClickZoomOut }) {
  return (
    <div className={[styles.container, className].join(' ')} style={style}>
      <button className={styles.zoomIn} onClick={onClickZoomIn}>
        <ZoomInLogo className={styles.svg} />
      </button>
      <button className={styles.zoomOut} onClick={onClickZoomOut}>
        <ZoomOutLogo className={styles.svg} />
      </button>
    </div>
  );
}

CustomZoom.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClickZoomIn: PropTypes.func,
  onClickZoomOut: PropTypes.func,
};
