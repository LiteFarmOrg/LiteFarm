import React from 'react';
import styles from './footer.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Footer = ({
  children,
  className,
  hasWhiteBackground,
  ...props
}) => {
  return (
      <footer
        className={clsx(styles.footer, className, hasWhiteBackground && styles.whiteBackground)}
        {...props}
      >
        {hasWhiteBackground && <div style={{
          width: '100%',
          height: '24px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255,255 , 255, 1) 55.21%)',
          marginTop: '-16px',
          zIndex: '1',
        }}/>}
        <div className={styles.buttonContainer}>
          {children}
        </div>
      </footer>
  );
};

Footer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  hasWhiteBackground: PropTypes.bool,
}

export default Footer;