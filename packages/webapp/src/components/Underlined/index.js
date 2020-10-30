import React from 'react';
import styles from './underlined.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Underlined = ({
  children = 'Link',
  classes = { underlined: "" },
  ...props
}) => {
  return (
    <p
      className={clsx(styles.underlined, classes.underlined)}
      {...props}
    >
      {children}
    </p>
  );
};

Underlined.propTypes = {
  children: PropTypes.string,
  classes: PropTypes.exact({underlined: PropTypes.string}),
}

export default Underlined;