import React from 'react';
import styles from './button.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Button = ({
  color = 'primary',
  children = 'Button',
  disabled = false,
  fullLength = false,
  classes = { btn: "" },
  onClick,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(styles.btn, styles[color], classes.btn, fullLength && styles.fullLength)}
      onClick
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  fullLength: PropTypes.bool,
  children: PropTypes.string,
  classes: PropTypes.exact({btn: PropTypes.string}),
  onClick: PropTypes.func,
}

export default Button;