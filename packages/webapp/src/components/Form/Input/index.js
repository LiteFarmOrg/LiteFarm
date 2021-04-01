import React, { useEffect, useRef, useState } from 'react';
import styles from './input.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { BiSearchAlt2, MdVisibility, MdVisibilityOff } from 'react-icons/all';
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
  unit,
  name,
  hookFormSetValue,
  showCross,
  ...props
}) => {
  warnings(hookFormSetValue, optional);
  const { t } = useTranslation(['translation', 'common']);
  const input = useRef();
  const onClear =
    optional || hookFormSetValue
      ? () => {
          hookFormSetValue(name, undefined, { shouldValidate: true });
          setShowError(false);
        }
      : () => {
          if (input.current && input.current?.value) {
            input.current.value = '';
            setShowError(false);
          }
        };

  const [inputType, setType] = useState(type);
  const isPassword = type === 'password';
  const showPassword = inputType === 'text';
  const setVisibility = () =>
    setType((prevState) => (prevState === 'password' ? 'text' : 'password'));
  const [showError, setShowError] = useState();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors]);

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
              <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                {t('common:OPTIONAL')}
              </Label>
            )}
          </Label>
          {toolTipContent && <MoreInfo content={toolTipContent} />}
          {icon && <span className={styles.icon}>{icon}</span>}
        </div>
      )}
      {showError && !unit && showCross && (
        <Cross
          onClick={onClear}
          style={{
            position: 'absolute',
            right: 0,
            transform: 'translate(-17px, 13px)',
            cursor: 'pointer',
          }}
        />
      )}
      {isSearchBar && <BiSearchAlt2 className={styles.searchIcon} />}
      {isPassword &&
        !showError &&
        (showPassword ? (
          <MdVisibility className={styles.visibilityIcon} onClick={setVisibility} />
        ) : (
          <MdVisibilityOff className={styles.visibilityIcon} onClick={setVisibility} />
        ))}
      {unit && <div className={styles.unit}>{unit}</div>}
      <input
        disabled={disabled}
        className={clsx(
          styles.input,
          showError && styles.inputError,
          isSearchBar && styles.searchBar,
        )}
        style={{ paddingRight: `${unit ? unit.length * 8 + 8 : 4}px`, ...classes.input }}
        aria-invalid={showError ? 'true' : 'false'}
        ref={mergeRefs(inputRef, input)}
        type={inputType}
        onKeyDown={onKeyDown}
        name={name}
        {...props}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? <Error style={classes.errors}>{errors}</Error> : null}
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
  unit: PropTypes.string,
  // reset is required when optional is true. When optional is true and reset is undefined, the component will crash on reset
  reset: PropTypes.func,
  hookFormSetValue: PropTypes.func,
  name: PropTypes.string,
};

export default Input;

export const numberOnKeyDown = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
export const integerOnKeyDown = (e) =>
  ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();
const warnings = (hookFormSetValue, optional) =>
  !hookFormSetValue &&
  optional &&
  console.error('hookFormSetValue prop is required when input field is optional');
