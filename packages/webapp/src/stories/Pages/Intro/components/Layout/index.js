import React from 'react';
import styles from './layout.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Footer from '../../../../Footer';

const Layout = ({
  classes = { container: '', footer: '' },
  children,
  buttonGroup,
  isSVG,
  history,
  auth
}) => {
  return (
    <>
      <div className={clsx(styles.container, isSVG && styles.svgContainer, classes.container)}>
        {children}
      </div>
      <Footer classes={{footer: classes.footer}}>
        {buttonGroup}
      </Footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.exact({ container: PropTypes.string, footer: PropTypes.string }),
  isSVG: PropTypes.bool,
}

export default Layout;