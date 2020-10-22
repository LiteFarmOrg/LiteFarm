import React from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Input = ({
  disabled = false,
  classes = { input: '', label: '' },
  label = 'label',
  children,
  ...props
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        disabled={disabled}
        className={clsx(styles.input, classes.input)}
        onClick
        {...props}
      />
      {children}
    </div>
  );
};

Input.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  classes: PropTypes.exact({ input: PropTypes.string }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default Input;