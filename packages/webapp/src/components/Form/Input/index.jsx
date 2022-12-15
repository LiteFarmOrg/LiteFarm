import React, { useEffect, useRef, useState } from 'react';
import styles from './input.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { BiSearchAlt2 } from 'react-icons/bi';
import { mergeRefs } from '../utils';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';
import Infoi from '../../Tooltip/Infoi';
import * as ReactHookForm from 'react-hook-form';
import i18n from '../../../locales/i18n';


/**
 * Creates a new text input on a form.
 * 
 * @param {Object} propTypes Interface describing types of props
 * @param {{
 *  input: React.CSSProperties, 
 *  label: React.CSSProperties,
 *  container: React.CSSProperties,
 *  info: React.CSSProperties,
 *  errors: React.CSSProperties
 * }} [propTypes.classes={}] Add style objects into child elements. (optional)  
 *     *default: { }*
 * @param {string} [propTypes.currency] Currency symbol or abbreviation. (optional)
 * @param {boolean} [propTypes.disabled=false]  Disable input functionality. (optional)  
 *     *default: false*
 * @param {(string|boolean)} [propTypes.errors] Shows error messages if truthy. (optional)
 * @param {boolean} [propTypes.hasLeaf] Has organic leaf identifier. (optional)
 * @param {ReactHookForm.UseFormRegisterReturn} [propTypes.hookFormRegister] Return object from register() from react-hook-form. (optional)
 * @param {(React.ReactNode[]|React.ReactNode)} [propTypes.icon] Pass one or an array of icon components (nodes). (optional)
 * @param {string} [propTypes.info] Visible help text below input. (optional)
 * @param {boolean} [propTypes.isSearchBar] Is being used as a search bar. (optional)
 * @param {string} [propTypes.label] Input label text. (optional)
 * @param {(number|string)} [propTypes.max] If input value > max, component will auto correct and set to max. (optional)
 * @param {(number|string)} [propTypes.min] If input value < min, component will auto correct and set to min. (optional)
 * @param {function()} [propTypes.onBlur] Callback function passed to child `<input />`. (optional)
 * @param {function()} [propTypes.onChange] Callback function passed to children: `<input />` and `<Cross />`. (optional)
 * @param {boolean} [propTypes.optional] Label text should include "(optional)" (optional)
 * @param {string} [propTypes.placeholder] Example or dummy text in input box. (optional)
 * @param {boolean} [propTypes.showCross] Show the Close [X] button on error. (optional)  
 *     *default: false*
 * @param {React.CSSProperties} [propTypes.style] Add style to `<Input />`. (optional)
 * @param {string} [propTypes.toolTipContent] Text displayed on hover of Tooltip icon. (optional)
 * @param {string} [propTypes.type] One of React.HTMLInputTypeAttribute or 'decimal'. Affect visibility (ie passwords) and input sanitization. (optional)  
 *     *default: 'text'*
 * @param {string} [propTypes.unit] Shows text symbol or abbreviation for units.(optional)
 * @todo Deprecate propTypes.optional replace with hookFormRegister.required.
 * @todo Replace propTypes.type with React.HTMLInputTypeAttribute.
 * @todo Deprecate propTypes.unit and replace `<Input />` wit `<Unit />`.
 * @todo Input should be a controlled component.
*/
const Input = ({
  classes = {},
  currency,
  disabled = false,
  errors,
  hasLeaf,
  hookFormRegister,
  icon,
  info,
  isSearchBar,
  label,
  max,
  min,
  onBlur,
  onChange,
  optional,
  placeholder,
  showCross = true,
  style,
  toolTipContent,
  type = 'text',
  unit,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const name = hookFormRegister?.name ?? props?.name;
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

  return (
    <div
      className={clsx(styles.container)}
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
      {currency && <div className={styles.currency}>{currency}</div>}
      <input
        disabled={disabled}
        className={clsx(
          styles.input,
          showError && styles.inputError,
          isSearchBar && styles.searchBar,
        )}
        style={{
          paddingRight: `${unit ? unit.length * 8 + 8 : 4}px`,
          paddingLeft: currency ? `${currency.length * 8 + 12}px` : undefined,
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
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <Error data-cy="error" style={classes.errors}>
          {errors}
        </Error>
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
  const error = ReactHookForm.get(errors, name);
  if (error?.type === 'required') {
    return i18n.t('common:REQUIRED');
  } else {
    return error?.message;
  }
};
