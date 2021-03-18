import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Cross from '../../../assets/images/map/cross.svg';
import Checkmark from '../../../assets/images/map/checkmark.svg';
import clsx from 'clsx';
import ProgressBar from '../ProgressBar';

export default function PureMapSuccessHeader({ className, style, closeSuccessHeader }) {
  const { t } = useTranslation();
  const [dismissProgressBar, setDismissProgressBar] = useState(false);

  const handleClickHeader = () => {
    setDismissProgressBar(true);
  };

  return (
    <div
      className={clsx(className)}
      onClick={() => handleClickHeader()}
      onMouseEnter={() => console.log('mouseover')}
    >
      <div className={clsx(styles.container)} style={style}>
        <div className={styles.headerText}>
          <input type="image" src={Checkmark} className={styles.button} />
          <span style={{ paddingLeft: '10px' }}>{t('FARM_MAP.SUCCESS_HEADER_TITLE')}</span>
        </div>
        <div style={{ paddingTop: '5px' }}>
          <input type="image" src={Cross} className={styles.button} onClick={closeSuccessHeader} />
        </div>
      </div>
      {!dismissProgressBar && <ProgressBar closeSuccessHeader={closeSuccessHeader} />}
    </div>
  );
}

PureMapSuccessHeader.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  farmName: PropTypes.string,
  closeSuccessHeader: PropTypes.func,
};
