import React from 'react';
import styles from './button.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

/**
 * Primary UI component for user interaction
 */
const Button = ({
  color = 'primary',
  label = 'Button',
  disabled = false,
  classes = { btn: "" },
  onClick,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(styles.btn, styles[color], classes.btn)}
      onClick
      {...props}
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  label: PropTypes.string,
  classes: PropTypes.object,
  onClick: PropTypes.func,
}

export default Button;