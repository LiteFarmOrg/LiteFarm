/*
 *  Copyright 2020-2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useRef, useState, CSSProperties, InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import {
  get,
  UseFormTrigger,
  FieldValues,
  UseFormRegisterReturn,
  FieldErrors,
} from 'react-hook-form';
import clsx from 'clsx';
import i18n from '../../../locales/i18n';
import styles from './input.module.scss';
import { mergeRefs } from '../utils';
import { Error, Info, TextWithExternalLink } from '../../Typography';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import { Cross } from '../../Icons';
import {
  MdVisibility,
  MdVisibilityOff,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { ReactComponent as SearchIcon } from '../../../assets/images/search.svg';
import { ReactComponent as SearchClearIcon } from '../../../assets/images/search-close.svg';
import TextButton from '../Button/TextButton';
import useElementWidth from '../../hooks/useElementWidth';

interface InputClasses {
  input?: CSSProperties;
  label?: CSSProperties;
  container?: CSSProperties;
  info?: CSSProperties;
  errors?: CSSProperties;
}

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'onBlur'> {
  link?: string;
  textWithExternalLink?: string;
  openCalendar?: boolean;
  disabled?: boolean;
  classes?: InputClasses;
  style?: CSSProperties;
  label?: string;
  optional?: boolean;
  info?: string;
  errors?: string | boolean;
  icon?: React.ReactNode;
  hookFormRegister?: UseFormRegisterReturn;
  isSearchBar?: boolean;
  type?: 'text' | 'password' | 'number' | 'decimal' | 'date';
  max?: number | string;
  min?: number | string;
  toolTipContent?: string;
  unit?: string;
  showCross?: boolean;
  onChange?: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      // (onClear, increment, decrement)
      | { target: HTMLInputElement },
  ) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  hasLeaf?: boolean;
  placeholder?: string;
  currency?: string;
  stepper?: boolean;
  className?: string;
  'data-testid'?: string;
  trigger?: UseFormTrigger<FieldValues>;
  onCleared?: () => void;
}

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
  trigger,
  onCleared,
  ...props
}: InputProps) => {
  const { t } = useTranslation(['translation', 'common']);
  const name = hookFormRegister?.name ?? props?.name;
  const currencyRef = useRef<HTMLDivElement>(null);

  const testId = props['data-testid'] || 'input';

  const [inputType, setType] = useState<string>(type);
  const isPassword = type === 'password';
  const showPassword = inputType === 'text';
  const setVisibility = () =>
    setType((prevState) => (prevState === 'password' ? 'text' : 'password'));

  const [showError, setShowError] = useState<boolean>();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors, disabled]);

  const input = useRef<HTMLInputElement>(null);

  const onClear = () => {
    if (input.current) {
      input.current.value = '';
      onChange?.({ target: input.current });
      hookFormRegister?.onChange({ target: input.current });
      // Manually trigger validation against the new value ''
      trigger?.(name);
      setShowError(false);
      onCleared?.();
    }
  };

  const onKeyDown = ['number', 'decimal'].includes(type) ? numberOnKeyDown : undefined;

  const increment = () => {
    if (input.current) {
      input.current.stepUp();
      if (max !== undefined && Number(input.current.value) > Number(max)) {
        input.current.value = String(max);
      }
      hookFormRegister?.onChange?.({
        target: input.current,
      });
      onChange?.({ target: input.current });
    }
  };

  const decrement = () => {
    if (input.current) {
      input.current.stepDown();
      if (min !== undefined && Number(input.current.value) < Number(min)) {
        input.current.value = String(min);
      }
      hookFormRegister?.onChange?.({
        target: input.current,
      });
      onChange?.({ target: input.current });
    }
  };

  useEffect(() => {
    if (openCalendar) {
      try {
        input.current?.showPicker();
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
        <InputBaseLabel
          label={label}
          optional={optional}
          hasLeaf={hasLeaf}
          toolTipContent={toolTipContent}
          icon={icon}
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
      {currency && (
        <div ref={currencyRef} className={styles.currency}>
          {currency}
        </div>
      )}
      <div className={styles.inputWrapper}>
        {unit && <div className={styles.unit}>{unit}</div>}
        {showError && !unit && showCross && (
          <Cross
            className={clsx(styles.clearIcon, inputType === 'date' && styles.date)}
            onClick={onClear}
          />
        )}
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
          placeholder={
            (!disabled && placeholder) || (isSearchBar && t('common:SEARCH')) || undefined
          }
          size={1}
          onChange={(e) => {
            onChange?.(e);
            hookFormRegister?.onChange?.(e);
          }}
          onBlur={(e) => {
            if (type === 'number' && input.current) {
              if (max !== undefined && Number(e.target.value) > Number(max)) {
                input.current.value = String(max);
                hookFormRegister?.onChange?.({
                  target: input.current,
                });
              } else if (min !== undefined && Number(e.target.value) < Number(min)) {
                input.current.value = String(min);
                hookFormRegister?.onChange?.({
                  target: input.current,
                });
              }
            }
            onBlur?.(e);
            if (input.current) {
              hookFormRegister?.onChange?.({
                target: input.current,
              });
            }
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
      {textWithExternalLink && link ? (
        <TextWithExternalLink link={link}>{textWithExternalLink}</TextWithExternalLink>
      ) : null}
    </div>
  );
};

export default Input;

/**
 * Indicates if a keyboard event should be accepted for an integer form input.
 * @param {KeyboardEvent} event
 * @returns {boolean} true if the event is acceptable; false otherwise
 */
const isEventOkForIntegerInput = (event: React.KeyboardEvent<HTMLInputElement>): boolean => {
  if (event.key.length > 1) return true; // Accept "Backspace", etc.
  return /[0-9]/.test(event.key); // Accept a digit, but no other single character.
};

/**
 * Always accepts backspace, arrow keys, and numbers.
 * Only accepts one period and only after 1 or more numbers.
 */
export const numberOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  if (event.key.length == 1) {
    const target = event.currentTarget;
    if (target.value.length == 0 || /\./.test(target.value)) {
      !/[0-9]/.test(event.key) && event.preventDefault();
    } else {
      !/[0-9]|\./.test(event.key) && event.preventDefault();
    }
  }
};

export const integerOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  if (isEventOkForIntegerInput(event)) return;
  event.preventDefault();
};

export const preventNumberScrolling = (e: React.WheelEvent<HTMLInputElement>): void =>
  e.currentTarget.blur();

export const getInputErrors = (
  errors: FieldErrors<FieldValues>,
  name: string,
): string | undefined => {
  const error = get(errors, name);
  if (error?.type === 'required') {
    return i18n.t('common:REQUIRED');
  } else {
    return error?.message;
  }
};
