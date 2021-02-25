import React from 'react';
import styles from './checkbox.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Main } from '../../Typography';

const Checkbox = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  inputRef,
  errors,
  ...props
}) => {
  return (
    <label
      className={clsx(styles.container, disabled && styles.disabled)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      <Main className={clsx(styles.label)} style={classes.label}>
        {label}
      </Main>
      <input type={'checkbox'} ref={inputRef} {...props} disabled={disabled} />
      <span className={clsx(styles.checkmark)} style={classes.checkbox} />
      {errors ? (
        <Error className={clsx(styles.error)} style={classes.error}>
          {errors}
        </Error>
      ) : null}
      {children}
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({
    checkbox: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    error: PropTypes.object,
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default Checkbox;
