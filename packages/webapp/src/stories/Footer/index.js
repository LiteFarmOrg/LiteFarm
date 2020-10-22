import React from 'react';
import styles from './footer.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Footer = ({
  children,
  classes = { footer: '' },
  ...props
}) => {
  return (
    <footer
      className={clsx(styles.footer, classes.footer)}
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
  classes: PropTypes.exact({ footer: PropTypes.string }),
}

export default Footer;