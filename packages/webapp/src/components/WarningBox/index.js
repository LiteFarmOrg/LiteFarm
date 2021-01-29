import { Label } from '../Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.scss';
import { ReactComponent as WarningIcon } from '../../assets/images/warning.svg';

export default function PureWarningBox({ text, children, ...props }) {
  const { t } = useTranslation();
  return (
    <div className={styles.warningBox} {...props}>
      <WarningIcon className={styles.icon} />
      <Label>{text}</Label>
    </div>
  );
}

PureWarningBox.prototype = {
  text: PropTypes.string,
};
