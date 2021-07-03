import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as Cross } from '../../assets/images/map/cross.svg';
import { ReactComponent as Checkmark } from '../../assets/images/map/checkmark.svg';
import clsx from 'clsx';
import ProgressBar from '../Map/ProgressBar';

export function PureSnackbarWithoutBorder({ className, onDismiss, title }) {
  const [dismissProgressBar, setDismissProgressBar] = useState(false);

  return (
    <div
      className={clsx(className)}
      onClick={() => setDismissProgressBar(true)}
      onMouseOver={() => setDismissProgressBar(true)}
    >
      <div className={clsx(styles.contentContainer)}>
        <div className={styles.headerText}>
          <Checkmark className={styles.button} />
          <span style={{ paddingLeft: '10px' }}>{title}</span>
        </div>
        <div style={{ paddingTop: '5px' }}>
          <Cross className={styles.button} onClick={onDismiss} />
        </div>
      </div>
      <div className={styles.progressBarContainer}>
        {!dismissProgressBar && <ProgressBar closeSuccessHeader={onDismiss} />}
      </div>
    </div>
  );
}

export const PureSnackbar = forwardRef(({ message, type, onDismiss }, ref) => (
  <div className={clsx(styles.container, styles[type])} ref={ref}>
    <PureSnackbarWithoutBorder title={message} onDismiss={onDismiss} />
  </div>
));

PureSnackbarWithoutBorder.prototype = {
  className: PropTypes.string,
  title: PropTypes.string,
  farmName: PropTypes.string,
  closeSuccessHeader: PropTypes.func,
};

PureSnackbar.prototype = {
  type: PropTypes.string,
  message: PropTypes.string,
  onDismiss: PropTypes.func,
};
