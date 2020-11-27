import React, { useRef, useState } from 'react';
import styles from './input.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Label, Info } from '../../Typography';
import { Cross } from '../../Icons';
import { MdVisibilityOff, MdVisibility } from 'react-icons/all';
import { BiSearchAlt2 } from 'react-icons/all';
import { mergeRefs } from '../utils';

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
  isSearchBar,
  type = 'text',
  ...props
}) => {
  const input = useRef();
  const onClear = () => {
    if (input.current && input.current.value) input.current.value = ''
  };
  const [inputType, setType] = useState(type);
  const isPassword = type === 'password';
  const showPassword = inputType === 'text';
  const setVisibility = () => setType((prevState => prevState === 'password' ? 'text' : 'password'));
  return (
    <div className={clsx(styles.container)} style={(style || classes.container) && { ...style, ...classes.container }}>
      {label && <Label>{label} {optional && <Label sm className={styles.sm}>(optional)</Label>}</Label>}
      {errors && <Cross onClick={onClear} className={styles.cross}/>}
      {isSearchBar && <BiSearchAlt2 className={styles.searchIcon}/>}
      {isPassword && showPassword ? <MdVisibility className={styles.visibilityIcon} onClick={setVisibility}/> :
        <MdVisibilityOff className={styles.visibilityIcon} onClick={setVisibility}/>}
      <input
        disabled={disabled}
        className={clsx(styles.input, errors && styles.inputError, isSearchBar && styles.searchBar)}
        style={classes.input}
        aria-invalid={errors ? 'true' : 'false'}
        ref={mergeRefs(inputRef, input)}
        type={inputType}
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
  isSearchBar: PropTypes.bool,
  type: PropTypes.string,
}

export default Input;