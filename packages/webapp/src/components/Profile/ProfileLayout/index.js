import React from 'react';

import styles from './profileLayout.module.scss';
import Footer from '../../Footer';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';

export default function ProfileLayout({ children, buttonGroup, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.container}>
        <Tabs value={0} aria-label="disabled tabs example">
          <Tab label="Account" />
          <Tab label="People" />
          <Tab label="Farm" />
        </Tabs>
        {children}
      </div>
      <Footer>{buttonGroup}</Footer>
    </form>
  );
}
ProfileLayout.propTypes = {
  buttonGroup: PropTypes.node,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
};
