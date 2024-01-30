import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Cross from '../../assets/images/map/cross.svg?react';
import Checkmark from '../../assets/images/map/checkmark.svg?react';
import clsx from 'clsx';
import ProgressBar from '../Map/ProgressBar';
import { VscWarning } from 'react-icons/vsc';

function Icon({ type = 'success' }) {
  if (type === 'error') return <VscWarning className={styles.errorIcon} />;
  if (type === 'success') return <Checkmark className={styles.button} />;
}

export function PureSnackbarWithoutBorder({ className, onDismiss, title, type }) {
  const [dismissProgressBar, setDismissProgressBar] = useState(false);

  return (
    <div
      data-cy="snackBar"
      className={clsx(className)}
      onClick={() => setDismissProgressBar(true)}
      onMouseOver={() => !type && setDismissProgressBar(true)}
    >
      <div className={clsx(styles.contentContainer)}>
        <div className={styles.headerText}>
          <Icon type={type} />
          <span style={{ paddingLeft: '10px' }}>{title}</span>
        </div>
        <div style={{ paddingTop: '5px' }}>
          <Cross className={styles.button} onClick={onDismiss} />
        </div>
      </div>
      <div className={styles.progressBarContainer}>
        {!dismissProgressBar && <ProgressBar type={type} onDismiss={onDismiss} />}
      </div>
    </div>
  );
}

export const PureSnackbar = forwardRef(function forwardSnackbarRef(
  { message, type, onDismiss },
  ref,
) {
  <div className={clsx(styles.container, styles[type])} ref={ref}>
    <PureSnackbarWithoutBorder title={message} onDismiss={onDismiss} type={type} />
  </div>;
});

PureSnackbarWithoutBorder.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  farmName: PropTypes.string,
  closeSuccessHeader: PropTypes.func,
  type: PropTypes.oneOf(['success', 'error']),
};

PureSnackbar.propTypes = {
  type: PropTypes.oneOf(['success', 'error']),
  message: PropTypes.string,
  onDismiss: PropTypes.func,
};
