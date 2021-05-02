import React from 'react';
import styles from './layout.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Footer from '../Footer';

const Layout = ({ classes = {}, children, buttonGroup, hasWhiteBackground, isSVG }) => {
  return (
    <>
      <div
        className={clsx(styles.container, isSVG && styles.svgContainer)}
        style={{ paddingBottom: hasWhiteBackground ? '104px' : undefined, ...classes.container }}
      >
        {children}
      </div>
      <Footer
        style={{
          bottom: 0,
          position: hasWhiteBackground ? 'sticky' : 'relative',
          ...classes.footer,
        }}
        hasWhiteBackground={hasWhiteBackground}
      >
        {buttonGroup}
      </Footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.exact({
    container: PropTypes.object,
    footer: PropTypes.object,
  }),
  isSVG: PropTypes.bool,
  hasWhiteBackground: PropTypes.bool,
};

export default Layout;
