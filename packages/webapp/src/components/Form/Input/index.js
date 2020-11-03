import React from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Label, Info } from '../../Typography';


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
      <Label>{label}</Label>
      <input
        disabled={disabled}
        className={clsx(styles.input, classes.input, errors && styles.inputError)}
        aria-invalid={errors ? 'true' : 'false'}
        ref={inputRef}
        {...props}
      />
      {icon && <span className={styles.icon}>{icon}</span>}
      {info && !errors && <Info className={clsx(classes.info)}>{info}</Info>}
      {errors && !disabled ? <Error>{errors}</Error> : null}
    </div>
  );
};

Input.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  info: PropTypes.string,
  errors: PropTypes.string,
  classes: PropTypes.exact({
    input: PropTypes.string,
    label: PropTypes.string,
    container: PropTypes.string,
    info: PropTypes.string,
  }),
  icon: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
}

export default Input;