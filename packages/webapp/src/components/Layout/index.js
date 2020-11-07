import React from 'react';
import styles from './layout.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Footer from '../Footer';

const Layout = ({
  classes = {},
  children,
  buttonGroup,
  isSVG,
}) => {
  return (
    <>
      <div className={clsx(styles.container, isSVG && styles.svgContainer)} style={classes.container}>
        {children}
      </div>
      <Footer style={classes.footer}>
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
  classes: PropTypes.exact({ container: PropTypes.object, footer: PropTypes.object }),
  isSVG: PropTypes.bool,
}

export default Layout;
