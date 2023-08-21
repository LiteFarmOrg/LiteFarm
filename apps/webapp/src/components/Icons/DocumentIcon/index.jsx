import React from 'react';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import { ReactComponent as DocumentFrame } from '../../../assets/images/document/document.svg';

export const DocumentIcon = ({ extensionName, ...props }) => {
  return (
    <div className={styles.container} {...props}>
      <DocumentFrame />
      <div className={styles.extensionName}>{extensionName?.toUpperCase?.()}</div>
    </div>
  );
};

DocumentIcon.propTypes = {
  onClick: PropTypes.func,
  extensionName: PropTypes.string,
};
