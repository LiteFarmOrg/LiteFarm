import React from 'react';
import styles from './radio.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Infoi from '../../Tooltip/Infoi';
import Pill from '../../Pill';

const Radio = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  hookFormRegister,
  onChange,
  onBlur,
  inputRef,
  toolTipContent,
  pill,
  checked,
  ...props
}) => {
  const name = hookFormRegister?.name ?? props?.name;

  return (
    <label
      className={clsx(styles.container, disabled && styles.disabled)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      <input
        name={name}
        ref={hookFormRegister?.ref || inputRef}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          hookFormRegister?.onBlur(e);
        }}
        type={'radio'}
        {...props}
        disabled={disabled}
        checked={checked}
        className={styles.defaultRadio}
      />
      <span className={clsx(styles.label)} style={classes.label}>
        {label}
        {pill && <Pill body={pill} spaceBefore={!!label} active={checked}></Pill>}
      </span>
      {toolTipContent && <Infoi content={toolTipContent} />}

      <span className={clsx(styles.checkmark)} style={classes.checkbox}>
        <svg viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" />
          <circle cx="8" cy="8" r="4" />
        </svg>
      </span>
      {children}
    </label>
  );
};

Radio.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({
    checkbox: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  hookFormRegister: PropTypes.exact({
    ref: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  pill: PropTypes.string,
};

export default Radio;
