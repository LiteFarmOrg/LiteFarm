import React from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Input = ({
  disabled = false,
  classes = { input: '', label: '', info: '', container: '' },
  label = 'label',
  info,
  errors,
  icon,
  inputRef,
  ...props
}) => {
  return (
    <div className={clsx(styles.container, classes.container)}>
      <label className={styles.label}>{label}</label>
      <input
        disabled={disabled}
        className={clsx(styles.input, classes.input)}
        aria-invalid={errors? "true" : "false"}
        ref={inputRef}
        {...props}
      />
      {icon && <span className={styles.icon}>{icon}</span>}
      {info && !errors && <p className={clsx(styles.info, classes.info)}>{info}</p>}
      {errors}
    </div>
  );
};

Input.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  info: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  classes: PropTypes.exact({ input: PropTypes.string, label: PropTypes.string, container: PropTypes.string, info: PropTypes.string }),
  icon: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  inputRef: PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.instanceOf(Element) })
])
}

export default Input;