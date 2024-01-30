import React, { useEffect, useRef, useState } from 'react';
import styles from './input.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label, TextWithExternalLink } from '../../Typography';
import { Cross } from '../../Icons';
import {
  MdVisibility,
  MdVisibilityOff,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import SearchIcon from '../../../assets/images/search.svg?react';
import SearchClearIcon from '../../../assets/images/search-close.svg?react';
import TextButton from '../Button/TextButton';
import { mergeRefs } from '../utils';
import { useTranslation } from 'react-i18next';
import Leaf from '../../../assets/images/signUp/leaf.svg?react';
import Infoi from '../../Tooltip/Infoi';
import { get } from 'react-hook-form';
import i18n from '../../../locales/i18n';
import useElementWidth from '../../hooks/useElementWidth';

const Input = ({
  link,
  textWithExternalLink,
  openCalendar,
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
  placeholder,
  currency,
  stepper = false,
  className = '',
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const name = hookFormRegister?.name ?? props?.name;
  const currencyRef = useRef(null);

  const testId = props['data-testid'] || 'input';

  const [inputType, setType] = useState(type);
  const isPassword = type === 'password';
  const showPassword = inputType === 'text';
  const setVisibility = () =>
    setType((prevState) => (prevState === 'password' ? 'text' : 'password'));

  const [showError, setShowError] = useState();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors]);
  const input = useRef();
  const onClear = () => {
    input.current.value = '';
    onChange?.({ target: input.current });
    hookFormRegister?.onChange({ target: input.current });
    setShowError(false);
  };

  const onKeyDown = ['number', 'decimal'].includes(type) ? numberOnKeyDown : undefined;

  const increment = () => {
    input.current.stepUp();
    if (max !== undefined && input.current.value > max) {
      input.current.value = max;
    }
    hookFormRegister?.onChange?.({ target: input.current });
    onChange?.({ target: input.current });
  };

  const decrement = () => {
    input.current.stepDown();
    if (min !== undefined && input.current.value < min) {
      input.current.value = min;
    }
    hookFormRegister?.onChange?.({ target: input.current });
    onChange?.({ target: input.current });
  };

  useEffect(() => {
    if (openCalendar) {
      try {
        input.current.showPicker();
      } catch (e) {
        console.log(e);
      }
    }
  }, [openCalendar]);

  const { elementWidth } = useElementWidth(currencyRef);

  return (
    <div
      className={clsx(styles.container, className)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {(label || toolTipContent || icon) && (
        <div className={styles.labelContainer}>
          <Label style={{ position: 'absolute', bottom: 0 }}>
            {label}
            {optional && (
              <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
                {t('common:OPTIONAL')}
              </Label>
            )}
            {hasLeaf && <Leaf className={styles.leaf} />}
          </Label>
          {toolTipContent && (
            <div className={styles.tooltipIconContainer}>
              <Infoi content={toolTipContent} />
            </div>
          )}
          {icon && <span className={styles.icon}>{icon}</span>}
        </div>
      )}
      {showError && !unit && showCross && (
        <Cross
          onClick={onClear}
          style={{
            position: 'absolute',
            right: 0,
            transform: inputType === 'date' ? 'translate(-26px, 15px)' : 'translate(-17px, 15px)',
            cursor: 'pointer',
            zIndex: 1,
          }}
        />
      )}
      {isPassword &&
        !showError &&
        (showPassword ? (
          <MdVisibility
            aria-label="hide-password"
            className={styles.visibilityIcon}
            onClick={setVisibility}
          />
        ) : (
          <MdVisibilityOff
            aria-label="show-password"
            className={styles.visibilityIcon}
            onClick={setVisibility}
          />
        ))}
      {unit && <div className={styles.unit}>{unit}</div>}
      {currency && (
        <div ref={currencyRef} className={styles.currency}>
          {currency}
        </div>
      )}
      <div className={styles.inputWrapper}>
        <input
          data-testid={testId}
          disabled={disabled}
          className={clsx(
            styles.input,
            showError && styles.inputError,
            isSearchBar && styles.searchBar,
          )}
          style={{
            paddingRight: `${unit ? unit.length * 8 + 8 : 4}px`,
            paddingLeft: currency ? `${elementWidth + 12}px` : undefined,
            ...classes.input,
          }}
          aria-invalid={showError ? 'true' : 'false'}
          ref={mergeRefs(hookFormRegister?.ref, input)}
          type={inputType}
          min={inputType === 'date' ? min : undefined}
          max={inputType === 'date' ? max || '9999-12-31' : undefined}
          onKeyDown={onKeyDown}
          name={name}
          placeholder={(!disabled && placeholder) || (isSearchBar && t('common:SEARCH'))}
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
            hookFormRegister?.onChange?.({ target: input.current });
            hookFormRegister?.onBlur?.(e);
            i18n.t('common:REQUIRED') === errors && setShowError(true);
          }}
          onWheel={type === 'number' ? preventNumberScrolling : undefined}
          {...props}
        />
        {stepper && type === 'number' && (
          <div className={styles.stepper}>
            <MdKeyboardArrowUp
              aria-label="increase"
              className={styles.stepperIcons}
              onClick={increment}
            />
            <MdKeyboardArrowDown
              aria-label="decrease"
              className={styles.stepperIcons}
              onClick={decrement}
            />
          </div>
        )}
        {isSearchBar && input?.current?.value && (
          <TextButton onClick={onClear}>
            <SearchClearIcon className={styles.searchClearIcon} />
          </TextButton>
        )}
      </div>
      {isSearchBar && <SearchIcon className={styles.searchIcon} />}
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <Error data-cy="error" style={classes.errors}>
          {errors}
        </Error>
      ) : null}
      {textWithExternalLink ? (
        <TextWithExternalLink link={link}>{textWithExternalLink}</TextWithExternalLink>
      ) : null}
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
  stepper: PropTypes.bool,
  toolTipContent: PropTypes.string,
  unit: PropTypes.string,
  currency: PropTypes.string,
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
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Input;

/**
 * Indicates if a keyboard event should be accepted for an integer form input.
 * @param {KeyboardEvent} event
 * @returns {boolean} true if the event is acceptable; false otherwise
 */
const isEventOkForIntegerInput = (event) => {
  if (event.key.length > 1) return true; // Accept "Backspace", etc.
  return /[0-9]/.test(event.key); // Accept a digit, but no other single character.
};

/**
 * Always accepts backspace, arrow keys, and numbers.
 * Only accepts one period and only after 1 or more numbers.
 */
export const numberOnKeyDown = (event) => {
  if (event.key.length == 1) {
    if (event.target.value.length == 0 || /\./.test(event.target.value)) {
      !/[0-9]/.test(event.key) && event.preventDefault();
    } else {
      !/[0-9]|\./.test(event.key) && event.preventDefault();
    }
  }
};

export const integerOnKeyDown = (event) => {
  if (isEventOkForIntegerInput(event)) return;
  event.preventDefault();
};
export const preventNumberScrolling = (e) => e.target.blur();

export const getInputErrors = (errors, name) => {
  const error = get(errors, name);
  if (error?.type === 'required') {
    return i18n.t('common:REQUIRED');
  } else {
    return error?.message;
  }
};
