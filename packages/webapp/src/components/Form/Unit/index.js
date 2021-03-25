import React, { useEffect, useMemo, useState } from 'react';
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
import { area_total_area, getDefaultUnit, roundToTwoDecimal } from '../../../util/unit';
import { Controller } from 'react-hook-form';

const unitOptionMap = {
  m2: { label: 'm2', value: 'm2' },
  ha: { label: 'ha', value: 'ha' },
  ft2: { label: 'sqft', value: 'ft2' },
  ac: { label: 'ac', value: 'ac' },
  cm: { label: 'cm', value: 'cm' },
  m: { label: 'm', value: 'm' },
  km: { label: 'km', value: 'km' },
  in: { label: 'in', value: 'in' },
  ft: { label: 'ft', value: 'ft' },
  mi: { label: 'mi', value: 'mi' },
  'l/min': { label: 'l/m', value: 'l/min' },
  'l/h': { label: 'l/h', value: 'l/h' },
  'gal/min': { label: 'g/m', value: 'gal/min' },
  'gal/h': { label: 'g/h', value: 'gal/h' },
  g: { label: 'g', value: 'g' },
  kg: { label: 'kg', value: 'kg' },
  mt: { label: 'mt', value: 'mt' },
  oz: { label: 'oz', value: 'oz' },
  lb: { label: 'lb', value: 'lb' },
  t: { label: 't', value: 't' },
};

const getOptions = (unitType = area_total_area, system) => {
  return unitType[system].units.map((unit) => unitOptionMap[unit]);
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
    width: '36px',
  }),
  singleValue: () => ({
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif',
    width: '40px',
    overflowX: 'hidden',
    textAlign: 'center',
    position: 'absolute',
  }),
  placeholder: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: ' 14px 4px 12px 0',
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
  hookFormSetError,
  defaultValue,
  system,
  control,
  unitType = area_total_area,
  from: defaultValueUnit,
  to,
  required,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const onClear = () => {
    hookFormSetValue(name, undefined, { shouldValidate: true });
    setVisibleInputValue('');
    setShowError(false);
  };

  const [showError, setShowError] = useState();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors]);

  const { displayUnit, displayValue, options, databaseUnit } = useMemo(() => {
    const databaseUnit = defaultValueUnit ?? unitType.databaseUnit;
    const options = getOptions(unitType, system);
    return to
      ? {
          displayUnit: to,
          displayValue:
            defaultValue && roundToTwoDecimal(convert(defaultValue).from(databaseUnit).to(to)),
          options,
          databaseUnit,
        }
      : {
          ...getDefaultUnit(unitType, defaultValue, system, databaseUnit),
          options,
          databaseUnit,
        };
  }, [unitType, defaultValue, system, defaultValueUnit, to]);

  const [visibleInputValue, setVisibleInputValue] = useState(displayValue);
  useEffect(() => {
    for (const option of options) {
      if (option.value === displayUnit) {
        hookFormSetValue(displayUnitName, option);
        break;
      }
    }
  }, []);

  const inputOnChange = (e) => {
    setVisibleInputValue(e.target.value);
    const unit = hookFormGetValue(displayUnitName).value;
    hookFormSetValue(name, convert(e.target.value).from(unit).to(databaseUnit), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const inputOnBlur = (e) => {
    if (isNaN(e.target.value)) {
      hookFormSetError(name, {
        message: t('UNIT.INVALID_NUMBER'),
      });
    } else if (required && e.target.value === '') {
      hookFormSetError(name, {
        message: t('common:REQUIRED'),
      });
    } else if (e.target.value === '') {
      hookFormSetValue(name, undefined, { shouldValidate: true });
      setVisibleInputValue('');
    } else if (e.target.value > 1000000000) {
      hookFormSetError(name, {
        type: 'manual',
        message: t('UNIT.MAXIMUM'),
      });
    } else {
      inputOnChange({ target: { value: roundToTwoDecimal(e.target.value) } });
    }
  };

  const optionOnChange = (e) => {
    setVisibleInputValue(
      roundToTwoDecimal(convert(hookFormGetValue(name)).from(databaseUnit).to(e.value)),
    );
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
            transform: 'translate(-61px, 23px)',
            lineHeight: '40px',
            cursor: 'pointer',
            zIndex: 1,
            width: '37px',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        />
      )}
      <div className={styles.inputContainer}>
        <input
          disabled={disabled}
          className={clsx(styles.input, errors)}
          style={{ ...classes.input }}
          aria-invalid={showError ? 'true' : 'false'}
          type={'number'}
          value={visibleInputValue}
          size={1}
          onKeyDown={numberOnKeyDown}
          onBlur={inputOnBlur}
          onChange={inputOnChange}
          {...props}
        />

        <Controller
          control={control}
          name={displayUnitName}
          render={({ onChange, onBlur, value, name, ref }) => (
            <Select
              onBlur={onBlur}
              onChange={(e) => {
                optionOnChange(e);
                onChange(e);
              }}
              value={value}
              inputRef={ref}
              customStyles
              styles={reactSelectStyles}
              isSearchable={false}
              options={options}
            />
          )}
        />
        <div className={clsx(styles.pseudoInputContainer, errors && styles.inputError)}>
          <div className={clsx(styles.verticleDivider, errors && styles.inputError)} />
        </div>
      </div>
      <input
        ref={register({ required, valueAsNumber: true })}
        name={name}
        className={styles.hiddenInput}
        defaultValue={defaultValue}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <div style={{ position: 'relative', height: '20px' }}>
          <Error style={{ position: 'absolute', ...classes.errors }}>{errors?.message}</Error>
        </div>
      ) : null}
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
  style: PropTypes.object,
  hookFormSetValue: PropTypes.func,
  hookFormGetValue: PropTypes.func,
  hookFormSetError: PropTypes.func,
  name: PropTypes.string,
  system: PropTypes.oneOf(['imperial', 'metric']),
  unitType: PropTypes.shape({
    metric: PropTypes.object,
    imperial: PropTypes.object,
    databaseUnit: PropTypes.string,
  }),
  /*
  Unit name from must
  */
  from: PropTypes.string,
  to: PropTypes.string,
  required: PropTypes.bool,
};

export default Unit;
