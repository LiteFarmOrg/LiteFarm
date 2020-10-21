import React from 'react';
import styles from './button.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  color = 'primary',
  label = 'Button',
  disabled = false,
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(styles.btn, styles[color], className)}
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
  className: PropTypes.string,
  onClick: PropTypes.func,
}