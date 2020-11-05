import React from 'react';
import styles from './checkbox.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Main } from '../../Typography';


const Checkbox = ({
  label = 'label',
  disabled = false,
  classes = { checkbox: '', label: '', container: '', error:'' },
  children,
  style,
  inputRef,
  errors,
  ...props
}) => {
  return (
    <label className={clsx(styles.container, classes.container, disabled && styles.disabled)} style={style && {...style}}>
      <Main className={clsx(styles.label, classes.label)}>{label}</Main>
      <input type={'checkbox'} ref={inputRef} {...props} disabled={disabled}/>
      <span className={clsx(styles.checkmark, classes.checkbox)}/>
      {errors ? <Error className={clsx(styles.error, classes.error)}>{errors}</Error> : null}
      {children}
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({ checkbox: PropTypes.string, label: PropTypes.string, container: PropTypes.string, error: PropTypes.string }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export default Checkbox;
