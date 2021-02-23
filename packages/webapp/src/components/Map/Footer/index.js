import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/add.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/export.svg';

export default function PureMapFooter({
  className,
  style,
  isAdmin,
}) {
  return (
    <div
      className={[styles.container, className].join(' ')}
      style={style}
    >
      {isAdmin && <div className={styles.button}><AddLogo /></div>}
      <div className={styles.button}><FilterLogo /></div>
      <div className={styles.button}><ExportLogo /></div>
    </div>
  );
}

PureMapFooter.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
};
