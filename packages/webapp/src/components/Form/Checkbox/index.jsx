import React from 'react';
import styles from './checkbox.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Main } from '../../Typography';
import { ReactComponent as PartiallyChecked } from '../../../assets/images/partially-checked.svg';
import { ReactComponent as UncheckedEnabled } from '../../../assets/images/unchecked-enabled.svg';
import { ReactComponent as CheckedEnabled } from '../../../assets/images/checked-enabled.svg';

const Checkbox = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  onChange,
  onBlur,
  hookFormRegister,
  errors,
  sm,
  tooltipContent = undefined,
  partiallyChecked = false,
  ...props
}) => {
  const name = hookFormRegister?.name ?? props?.name;
  return (
    <label
      className={clsx(styles.container, disabled && styles.disabled)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      <input
        type={'checkbox'}
        ref={hookFormRegister?.ref}
        name={name}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          hookFormRegister?.onBlur(e);
        }}
        {...props}
        disabled={disabled}
      />
      {partiallyChecked ? (
        <PartiallyChecked className={styles.checked} />
      ) : (
        <CheckedEnabled className={styles.checked} />
      )}
      <UncheckedEnabled className={styles.unchecked} />
      <Main
        className={clsx(styles.label, sm && styles.smallLabel)}
        style={classes.label}
        tooltipContent={tooltipContent}
        data-cy="checkbox-component"
      >
        {label}
      </Main>
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
  hookFormRegister: PropTypes.exact({
    ref: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  sm: PropTypes.bool,
  partiallyChecked: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default Checkbox;
