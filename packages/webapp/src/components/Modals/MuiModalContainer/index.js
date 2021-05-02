import styles from './styles.module.scss';
import React from 'react';
import { Paper } from '@material-ui/core';

const MuiModalContainer = ({ children }) => {
  return <Paper className={styles.paper}>{children}</Paper>;
};

export default MuiModalContainer;
