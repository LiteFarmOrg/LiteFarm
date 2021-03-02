import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as NorthLogo } from '../../../assets/images/map/north.svg';

export default function CustomCompass({
  className,
  style,
  onClick,
}) {
  return (
    <div
      className={[styles.container, className].join(' ')}
      style={style}
    >
      <NorthLogo className={styles.svg} />
    </div>
  );
}

CustomCompass.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};
