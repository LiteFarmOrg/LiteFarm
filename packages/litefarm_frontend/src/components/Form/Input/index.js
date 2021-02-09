import React, { useEffect, useRef, useState } from 'react';
import styles from './input.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Label, Info } from '../../Typography';
import { Cross } from '../../Icons';
import { MdVisibilityOff, MdVisibility } from 'react-icons/all';
import { BiSearchAlt2 } from 'react-icons/all';
import { mergeRefs } from '../utils';
import MoreInfo from '../../Tooltip/MoreInfo';
import { useTranslation } from 'react-i18next';

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
  toolTipContent,
  reset,
  ...props
}) => {
  const { t } = useTranslation();
  const input = useRef();
  const onClear =
    optional || reset
      ? () => reset()
      : () => {
          if (input.current && input.current?.value) {
            input.current.value = '';
            setShowError(false);
          }
        };
  useEffect(() => {
    setShowError(!!errors);
  }, [errors]);

  const [inputType, setType] = useState(type);
  const isPassword = type === 'password';
  const showPassword = inputType === 'text';
  const setVisibility = () =>
    setType((prevState) => (prevState === 'password' ? 'text' : 'password'));
  const [showError, setShowError] = useState(isPassword);

  const onKeyDown = type === 'number' ? numberOnKeyDown : undefined;
  return (
    <div
      className={clsx(styles.container)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {(label || toolTipContent || icon) && (
        <div className={styles.labelContainer}>
          <Label>
            {label}{' '}
            {optional && (
              <Label sm className={styles.sm}>
                ({t('common:OPTIONAL')})
              </Label>
            )}
          </Label>
          {toolTipContent && <MoreInfo content={toolTipContent} />}
          {icon && <span className={styles.icon}>{icon}</span>}
        </div>
      )}
      {showError && <Cross onClick={onClear} style={{  position: 'absolute',
        right: 0,
        transform: 'translate(-17px, 13px)',
        cursor: 'pointer'}} />}
      {isSearchBar && <BiSearchAlt2 className={styles.searchIcon} />}
      {isPassword &&
        !showError &&
        (showPassword ? (
          <MdVisibility className={styles.visibilityIcon} onClick={setVisibility} />
        ) : (
          <MdVisibilityOff className={styles.visibilityIcon} onClick={setVisibility} />
        ))}
      <input
        disabled={disabled}
        className={clsx(
          styles.input,
          showError && styles.inputError,
          isSearchBar && styles.searchBar,
        )}
        style={classes.input}
        aria-invalid={showError ? 'true' : 'false'}
        ref={mergeRefs(inputRef, input)}
        type={inputType}
        onKeyDown={onKeyDown}
        {...props}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError && !disabled ? <Error style={classes.errors}>{errors}</Error> : null}
    </div>
  );
};

Input.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  optional: PropTypes.bool,
  info: PropTypes.string,
  errors: PropTypes.string,
  clearErrors: PropTypes.func,
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
    errors: PropTypes.object,
  }),
  icon: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  style: PropTypes.object,
  isSearchBar: PropTypes.bool,
  type: PropTypes.string,
  toolTipContent: PropTypes.string,
  // reset is required when optional is true. When optional is true and reset is undefined, the component will crash on reset
  reset: PropTypes.func,
};

export default Input;

export const numberOnKeyDown = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
export const integerOnKeyDown = (e) =>
  ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();
