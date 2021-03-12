import React from 'react';
import styles from './styles.module.scss';
import { ReactComponent as WarningIcon } from '../../assets/images/warning.svg';
import clsx from 'clsx';

export default function PureWarningBox({ children, className, ...props }) {
  return (
    <div className={clsx(styles.warningBox, className)} {...props}>
      <WarningIcon className={styles.icon} />
      {children}
    </div>
  );
}
