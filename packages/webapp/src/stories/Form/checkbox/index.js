import React from 'react';
import styles from './checkbox.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Input = ({
  disabled = false,
  classes = { checkbox: '', label: '' },
  label = 'label',
  children,
  ...props
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        disabled={disabled}
        type={'checkbox'}
        className={clsx(styles.checkbox, classes.checkbox)}
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
  classes: PropTypes.exact({ checkbox: PropTypes.string, label: PropTypes.string }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default Input;