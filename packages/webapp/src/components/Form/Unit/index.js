import React, { useEffect, useRef, useState } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { mergeRefs } from '../utils';
import { useTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../Input';
import Select from 'react-select';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';

const reactSelectStyles = {
  ...reactSelectDefaultStyles,
  control: (provided, state) => ({
    display: 'flex',
    border: `none`,
    boxShadow: 'none',
    boxSizing: 'border-box',
    borderRadius: '4px',
    height: '48px',
    paddingLeft: '0',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    background: 'transparent',
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: '0',
  }),
  singleValue: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    width: '44px',
    overflowX: 'hidden',
    textAlign: 'center',
  }),
  placeholder: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--iconDefault)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    width: '44px',
    overflowX: 'hidden',
  }),
  input: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    width: '0',
    margin: '0',
    padding: '0',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: ' 14px 0 12px 0',
  }),
};
const Unit = ({
  disabled = false,
  classes = { container: {} },
  style = {},
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
  options,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const input = useRef();
  const onClear = () => {
    hookFormSetValue(name, undefined, { shouldValidate: true });
    setShowError(false);
  };

  const [showError, setShowError] = useState();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors]);

  return (
    <div className={clsx(styles.container)} style={{ ...style, ...classes.container }}>
      {label && (
        <div className={styles.labelContainer}>
          <Label>
            {label}{' '}
            {optional && (
              <Label sm className={styles.sm}>
                ({t('common:OPTIONAL')})
              </Label>
            )}
          </Label>
        </div>
      )}
      {showError && !unit && (
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
      <div className={styles.inputContainer}>
        <input
          disabled={disabled}
          className={clsx(styles.input)}
          style={{ ...classes.input }}
          aria-invalid={showError ? 'true' : 'false'}
          type={'number'}
          onKeyDown={numberOnKeyDown}
          {...props}
        />
        <Select
          customStyles
          styles={{
            ...reactSelectStyles,
            container: (provided, state) => ({ ...provided, ...style }),
          }}
          options={options}
          isSearchable={false}
          {...props}
        />
        <div className={clsx(styles.pseudoInputContainer, styles.inputError)}>
          <div className={clsx(styles.verticleDivider, styles.inputError)} />
        </div>
      </div>
      <input ref={mergeRefs(inputRef, input)} name={name} className={styles.hiddenInput} />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? <Error style={classes.errors}>{errors}</Error> : null}
    </div>
  );
};

Unit.propTypes = {
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

export default Unit;
