import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as Cross } from '../../assets/images/map/cross.svg';
import { ReactComponent as Checkmark } from '../../assets/images/map/checkmark.svg';
import clsx from 'clsx';
import ProgressBar from '../Map/ProgressBar';
import { VscWarning } from 'react-icons/vsc';
import CopyButton from '../ButtonGroup/CopyButton';

function Icon({ type = 'success' }) {
  if (type === 'error') return <VscWarning className={styles.errorIcon} />;
  if (type === 'success') return <Checkmark className={styles.button} />;
}

const getActionComponent = (action) => {
  if (action.type === 'link') {
    return (
      <span className={styles.actionContainer}>
        <a href={action.url}>{action.text}</a>
        <CopyButton text={action.text} />
      </span>
    );
  }
};

export function PureSnackbarWithoutBorder({ className, onDismiss, message, type }) {
  const [dismissProgressBar, setDismissProgressBar] = useState(false);

  let title,
    action = null;
  if (typeof message === 'string') title = message;
  else {
    title = message.message;
    action = getActionComponent(message.action);
  }

  const hideProgressBar = typeof message !== 'string' || dismissProgressBar;

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
          <span style={{ paddingLeft: '10px' }}>
            {title}
            {action}
          </span>
        </div>
        <div style={{ paddingTop: '5px' }}>
          <Cross className={styles.button} onClick={onDismiss} />
        </div>
      </div>
      <div className={styles.progressBarContainer}>
        {!hideProgressBar && <ProgressBar type={type} onDismiss={onDismiss} />}
      </div>
    </div>
  );
}

export const PureSnackbar = forwardRef(({ message, type, onDismiss }, ref) => (
  <div className={clsx(styles.container, styles[type])} ref={ref}>
    <PureSnackbarWithoutBorder message={message} onDismiss={onDismiss} type={type} />
  </div>
));

PureSnackbarWithoutBorder.prototype = {
  className: PropTypes.string,
  title: PropTypes.string,
  farmName: PropTypes.string,
  closeSuccessHeader: PropTypes.func,
  type: PropTypes.oneOf(['success', 'error']),
};

PureSnackbar.prototype = {
  type: PropTypes.oneOf(['success', 'error']),
  message: PropTypes.string,
  onDismiss: PropTypes.func,
};
