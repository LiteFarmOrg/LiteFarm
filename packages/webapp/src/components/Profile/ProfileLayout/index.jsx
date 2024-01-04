import React from 'react';

import styles from './styles.module.scss';
import Footer from '../../Footer';
import PropTypes from 'prop-types';

export default function ProfileLayout({ children, buttonGroup, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.container}>{children}</div>
      <Footer>{buttonGroup}</Footer>
    </form>
  );
}
ProfileLayout.propTypes = {
  buttonGroup: PropTypes.node,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
};
