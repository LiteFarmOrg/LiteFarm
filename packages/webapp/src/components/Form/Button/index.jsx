import React from 'react';
import styles from './button.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Button = ({
  color = 'primary',
  children = 'Button',
  sm,
  disabled = false,
  fullLength = false,
  className,
  onClick,
  type,
  inputRef,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        styles.btn,
        color && styles[color],
        sm && styles.sm,
        fullLength && styles.fullLength,
        className,
      )}
      onClick={onClick}
      type={type}
      ref={inputRef}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'none']),
  disabled: PropTypes.bool,
  fullLength: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sm: PropTypes.bool,
  className: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

export default Button;
