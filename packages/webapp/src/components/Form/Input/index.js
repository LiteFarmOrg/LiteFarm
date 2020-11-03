import React from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Label, Info } from '../../Typography';
import { Cross } from '../../Icons';

const Input = ({
  disabled = false,
  classes = { input: '', label: '', info: '', container: '' },
  label,
  optional,
  info,
  errors,
  icon,
  inputRef,
  onClear,
  ...props
}) => {
  return (
    <div className={clsx(styles.container, classes.container)}>
      {label && <Label>{label} {optional && <Label sm className={styles.sm}>(optional)</Label>}</Label>}
      {errors && <Cross onClick={onClear} className={styles.cross}/>}
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
  optional: PropTypes.bool,
  info: PropTypes.string,
  errors: PropTypes.string,
  onClear: PropTypes.func,
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