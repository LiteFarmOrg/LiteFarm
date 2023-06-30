import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { VscWarning } from 'react-icons/vsc';

export default function PureWarningBox({ children, className, iconClassName, ...props }) {
  return (
    <div className={clsx(className, styles.warningBox)} {...props}>
      <VscWarning className={clsx(iconClassName, styles.icon)} />
      {children}
    </div>
  );
}
