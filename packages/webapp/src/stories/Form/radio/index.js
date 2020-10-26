import React from 'react';
import styles from './radio.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


const Radio = ({
  label = 'label',
  disabled = false,
  classes = { checkbox: '', label: '', container: '' },
  children,
  style,
  inputRef,
  ...props
}) => {
  return (
    <label className={clsx(styles.container, classes.container, disabled && styles.disabled)} style={style && {...style}}>
      <p className={clsx(styles.label, classes.label)}>{label}</p>
      <input ref={inputRef} type={'radio'} {...props} disabled={disabled}/>
      <span className={clsx(styles.checkmark, classes.checkbox)}/>
      {children}
    </label>
  );
};

Radio.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({ checkbox: PropTypes.string, label: PropTypes.string, container: PropTypes.string }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default Radio;