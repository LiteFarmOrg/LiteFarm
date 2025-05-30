import React from 'react';
import styles from './layout.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Footer from '../Footer';

const Layout = ({
  classes = {},
  className = '',
  children,
  buttonGroup,
  hasWhiteBackground,
  isSVG,
  fullWidthContent = false,
  footer = true,
}) => {
  return (
    <>
      <div
        className={clsx(
          styles.container,
          !fullWidthContent && styles.padding,
          isSVG && styles.svgContainer,
          hasWhiteBackground && styles.paddingBottom,
          !footer && styles.marginBottom,
          className,
        )}
        style={{ ...classes.container }}
      >
        {children}
      </div>
      {footer && (
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
      )}
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
  classNames: PropTypes.string,
  isSVG: PropTypes.bool,
  hasWhiteBackground: PropTypes.bool,
};

export default Layout;
