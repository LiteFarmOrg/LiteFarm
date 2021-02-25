import React from 'react';
import styles from './radio.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Main } from '../../Typography';

const Radio = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  inputRef,
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
      <input ref={inputRef} type={'radio'} {...props} disabled={disabled} />
      <span className={clsx(styles.checkmark)} style={classes.checkbox} />
      {children}
    </label>
  );
};

Radio.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({
    checkbox: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default Radio;
