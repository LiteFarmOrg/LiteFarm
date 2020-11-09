import React from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Label, Info } from '../../Typography';
import { Cross } from '../../Icons';

const Input = ({
  disabled = false,
  classes = {},
  style,
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
    <div className={clsx(styles.container)} style={(style || classes.container) && {...style, ...classes.container}}>
      {label && <Label>{label} {optional && <Label sm className={styles.sm}>(optional)</Label>}</Label>}
      {errors && <Cross onClick={onClear} className={styles.cross}/>}
      <input
        disabled={disabled}
        className={clsx(styles.input, errors && styles.inputError)}
        style={classes.input}
        aria-invalid={errors ? 'true' : 'false'}
        ref={inputRef}
        {...props}
      />
      {icon && <span className={styles.icon}>{icon}</span>}
      {info && !errors && <Info style={classes.info}>{info}</Info>}
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
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
  }),
  icon: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  style: PropTypes.object,
}

export default Input;