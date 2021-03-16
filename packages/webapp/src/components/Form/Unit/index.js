import React, { useState } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { useTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../Input';
import Select from 'react-select';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import convert from 'convert-units';
import { defaultUnitMap } from '../../../util/unit';
import { Controller } from 'react-hook-form';

const areaOptions = {
  metric: [
    { label: 'mm2', value: 'mm2' },
    { label: 'ha', value: 'ha' },
  ],
  imperial: [
    { label: 'ft2', value: 'ft2' },
    { label: 'ac', value: 'ac' },
  ],
};
const distanceOptions = {
  metric: [
    { label: 'cm', value: 'cm' },
    { label: 'm', value: 'm' },
    { label: 'km', value: 'km' },
  ],
  imperial: [
    { label: 'in', value: 'in' },
    { label: 'ft', value: 'ft' },
    { label: 'mi', value: 'mi' },
  ],
};
const massOptions = {
  metric: [
    { label: 'g', value: 'g' },
    { label: 'kg', value: 'kg' },
    { label: 'mt', value: 'mt' },
  ],
  imperial: [
    { label: 'oz', value: 'oz' },
    { label: 'lb', value: 'lb' },
    { label: 't', value: 't' },
  ],
};
const seedOptions = {
  metric: [
    { label: 'g', value: 'g' },
    { label: 'kg', value: 'kg' },
  ],
  imperial: [
    { label: 'oz', value: 'oz' },
    { label: 'lb', value: 'lb' },
  ],
};
const unitTypeOptionMap = {
  length: distanceOptions,
  area: areaOptions,
  mass: massOptions,
};
const getOptions = (system, type) => {
  return unitTypeOptionMap[type][system];
};

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
  register,
  name,
  displayUnitName,
  hookFormSetValue,
  hookFormGetValue,
  defaultValue,
  system,
  unitType,
  from,
  to,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const onClear = () => {
    hookFormSetValue(name, undefined, { shouldValidate: true });
    setShowError(false);
  };

  const [showError, setShowError] = useState();
  // useEffect(() => {
  //   setShowError(!!errors && !disabled);
  // }, [errors]);

  const measureType = convert().describe(from || to).measure;
  const options = getOptions(system, measureType);
  const { displayUnit, displayValue } = to
    ? {
        displayUnit: to,
        displayValue: convert(defaultValue).from(from).to(to),
      }
    : defaultUnitMap[measureType](defaultValue, system, from);
  const [visibleInputValue, setVisibleInputValue] = useState(displayValue);
  // useEffect(()=>{
  //   for(const option of options){
  //     if(option.value === displayUnit){
  //       hookFormSetValue(displayUnitName, option);
  //       break;
  //     }
  //   }
  //   hookFormSetValue(name, defaultValue);
  // },[]);

  const inputOnChange = (e) => {
    setVisibleInputValue(e.target.value);
    const unit = hookFormGetValue(displayUnitName);
    hookFormSetValue(name, convert(e.target.value).from(unit).to(from));
  };

  const optionOnChange = (e) => {
    setVisibleInputValue(convert(hookFormGetValue(name)).from(from).to(e.target.value));
  };

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
      {showError && (
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
          value={visibleInputValue}
          onKeyDown={numberOnKeyDown}
          onChange={inputOnChange}
          {...props}
        />

        <Controller
          customStyles
          styles={reactSelectStyles}
          isSearchable={false}
          onChange={optionOnChange}
          options={options}
          name={displayUnitName}
          {...props}
          as={<Select />}
        />
        <div className={clsx(styles.pseudoInputContainer, styles.inputError)}>
          <div className={clsx(styles.verticleDivider, styles.inputError)} />
        </div>
      </div>
      <input ref={register} name={name} className={styles.hiddenInput} />
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
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
    errors: PropTypes.object,
  }),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  style: PropTypes.object,
  hookFormSetValue: PropTypes.func,
  name: PropTypes.string,
  system: PropTypes.oneOf(['imperial', 'metric']),
  unitType: PropTypes.oneOf(['area', 'distance', 'mass', 'seedAmount']),
  from: PropTypes.string,
  to: PropTypes.string,
};

export default Unit;
