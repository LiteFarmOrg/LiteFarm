import React from 'react';
import styles from './footer.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Footer = ({
  children,
  className,
  ...props
}) => {
  return (
    <footer
      className={clsx(styles.footer, className)}
      {...props}
    >
      {children}
    </footer>
  );
};

Footer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string
}

export default Footer;