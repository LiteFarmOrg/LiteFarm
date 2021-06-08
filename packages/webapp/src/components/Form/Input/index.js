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
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';

const Input = ({
  disabled = false,
  classes = {},
  style,
  label,
  optional,
  info,
  errors,
  icon,
  hookFormRegister,
  isSearchBar,
  type = 'text',
  max,
  min,
  toolTipContent,
  unit,
  showCross = true,
  onChange,
  onBlur,
  hasLeaf,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const input = useRef();
  const name = hookFormRegister?.name ?? props?.name;
  const onClear = () => {
    input.current.value = '';
    onChange?.({ target: input.current });
    hookFormRegister?.onChange({ target: input.current });
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

  const onKeyDown = ['number', 'decimal'].includes(type) ? numberOnKeyDown : undefined;

  return (
    <div
      className={clsx(styles.container)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {(label || toolTipContent || icon) && (
        <div className={styles.labelContainer}>
          <Label>
            {label}
            {optional && (
              <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                {t('common:OPTIONAL')}
              </Label>
            )}
            {hasLeaf && <Leaf className={styles.leaf} />}
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
            transform: 'translate(-17px, 15px)',
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
        ref={mergeRefs(hookFormRegister?.ref, input)}
        type={inputType}
        onKeyDown={onKeyDown}
        name={name}
        placeholder={isSearchBar && t('common:SEARCH')}
        size={'1'}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange?.(e);
        }}
        onBlur={(e) => {
          if (type === 'number') {
            if (max !== undefined && e.target.value > max) {
              input.current.value = max;
              hookFormRegister?.onChange?.({ target: input.current });
            } else if (min !== undefined && e.target.value < min) {
              input.current.value = min;
              hookFormRegister?.onChange?.({ target: input.current });
            }
          }
          onBlur?.(e);
          hookFormRegister?.onBlur?.(e);
        }}
        onWheel={type === 'number' ? preventNumberScrolling : undefined}
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
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
    errors: PropTypes.object,
  }),
  icon: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  style: PropTypes.object,
  isSearchBar: PropTypes.bool,
  type: PropTypes.string,
  toolTipContent: PropTypes.string,
  unit: PropTypes.string,
  name: PropTypes.string,
  hookFormRegister: PropTypes.exact({
    ref: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  hasLeaf: PropTypes.bool,
  max: PropTypes.number,
  min: PropTypes.number,
};

export default Input;

export const numberOnKeyDown = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
export const integerOnKeyDown = (e) =>
  ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();
export const preventNumberScrolling = (e) => e.target.blur();
