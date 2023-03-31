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
  ...props
}) => {
  const name = hookFormRegister?.name ?? props?.name;
  const pill = props?.pill;
  const checked = props?.checked;

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
      />
      <p className={clsx(styles.label)} style={classes.label}>
        {label}
        {pill && <Pill body={pill} spaceBefore={!!label} active={checked}></Pill>}
      </p>
      {toolTipContent && <Infoi content={toolTipContent} />}

      <span className={clsx(styles.checkmark)} style={classes.checkbox} />
      {children}
    </label>
  );
};

Radio.propTypes = {
  label: PropTypes.node,
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
};

export default Radio;
