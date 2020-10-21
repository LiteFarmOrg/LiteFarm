import React from 'react';
import styles from './layout.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Navbar from '../../Navbar/Navbar';
import Footer from '../../Footer';

/**
 * Primary UI component for user interaction
 */
const Layout = ({
  classes = { container: '', navbar: '', footer: '' },
  children,
  buttonGroup
}) => {
  return (
    <>
      <Navbar className={classes.navbar}/>
      <div className={clsx(classes.container, styles.container)}>
        {children}
      </div>
      <Footer classes={classes.footer}>
        {buttonGroup}
      </Footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.object
}

export default Layout;