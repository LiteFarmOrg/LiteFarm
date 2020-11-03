import React from 'react';
import styles from './button.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Button = ({
  color = 'primary',
  children = 'Button',
  sm,
  disabled = false,
  fullLength = false,
  classes = { btn: "" },
  className,
  onClick,
  type,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(styles.btn, color && styles[color], sm && styles.sm, classes.btn, fullLength && styles.fullLength, className)}
      onClick={onClick}
      type={type}
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
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sm: PropTypes.bool,
  className: PropTypes.string,
}

export default Button;