import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Cross from '../../../assets/images/map/cross.svg';
import Checkmark from '../../../assets/images/map/checkmark.svg';
import clsx from 'clsx';
import ProgressBar from '../ProgressBar';

export default function PureMapSuccessHeader({ className, closeSuccessHeader, title }) {
  const [dismissProgressBar, setDismissProgressBar] = useState(false);

  return (
    <div
      className={clsx(className)}
      onClick={() => setDismissProgressBar(true)}
      onMouseOver={() => setDismissProgressBar(true)}
    >
      <div className={clsx(styles.container)}>
        <div className={styles.headerText}>
          <input type="image" src={Checkmark} className={styles.button} />
          <span style={{ paddingLeft: '10px' }}>{title}</span>
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
  title: PropTypes.string,
  farmName: PropTypes.string,
  closeSuccessHeader: PropTypes.func,
};
