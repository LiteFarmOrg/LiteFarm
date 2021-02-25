import React from 'react';
import styles from './styles.module.scss';
import { ReactComponent as WarningIcon } from '../../assets/images/warning.svg';

export default function PureWarningBox({ children, ...props }) {
  return (
    <div className={styles.warningBox} {...props}>
      <WarningIcon className={styles.icon} />
      {children}
    </div>
  );
}
