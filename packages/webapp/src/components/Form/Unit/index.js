import React, { useEffect, useMemo, useState } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { useTranslation } from 'react-i18next';
import { numberOnKeyDown, preventNumberScrolling } from '../Input';
import Select from 'react-select';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import convert from 'convert-units';
import { area_total_area, getDefaultUnit, roundToTwoDecimal } from '../../../util/unit';
import { Controller } from 'react-hook-form';

export const unitOptionMap = {
  m2: { label: 'm²', value: 'm2' },
  ha: { label: 'ha', value: 'ha' },
  ft2: { label: 'ft²', value: 'ft2' },
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

const useReactSelectStyles = (disabled) => {
  return useMemo(
    () => ({
      ...reactSelectDefaultStyles,
      container: (provided, state) => ({
        ...provided,
        zIndex: 1,
      }),
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
        width: '42px',
        justifyContent: 'center',
      }),
      singleValue: (provided, state) => ({
        fontSize: '16px',
        lineHeight: '24px',
        color: state.isDisabled ? 'var(--grey600)' : 'var(--fontColor)',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontFamily: '"Open Sans", "SansSerif", serif',
        width: '42px',
        overflowX: 'hidden',
        textAlign: 'center',
        position: 'absolute',
      }),
      placeholder: () => ({
        display: 'none',
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        display: state.isDisabled ? 'none' : 'flex',
        padding: ' 14px 0 12px 0',
        transform: 'translateX(-4px)',
      }),
    }),
    [disabled],
  );
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
  hookFromWatch,
  defaultValue,
  system,
  control,
  unitType = area_total_area,
  from: defaultValueUnit,
  to,
  required,
  mode = 'onBlur',
  attached = false,
  ...props
}) => {
  const reactSelectStyles = useReactSelectStyles(disabled);
  const { t } = useTranslation(['translation', 'common']);
  const onClear = () => {
    hookFormSetValue(name, undefined);
    setVisibleInputValue('');
    setShowError(false);
  };

  const [showError, setShowError] = useState();
  useEffect(() => {
    setShowError(!!errors && !disabled);
  }, [errors]);

  const { displayUnit, displayValue, options, databaseUnit, isSelectDisabled } = useMemo(() => {
    const databaseUnit = defaultValueUnit ?? unitType.databaseUnit;
    const options = getOptions(unitType, system);
    const hookFormValue = hookFormGetValue(name);
    const value = hookFormValue || (hookFormValue === 0 ? 0 : defaultValue);
    const isSelectDisabled = options.length <= 1;
    return to && convert().describe(to)?.system === system
      ? {
          displayUnit: to,
          displayValue: defaultValue && roundToTwoDecimal(convert(value).from(databaseUnit).to(to)),
          options,
          databaseUnit,
          isSelectDisabled,
        }
      : {
          ...getDefaultUnit(unitType, value, system, databaseUnit),
          options,
          databaseUnit,
          isSelectDisabled,
        };
  }, [unitType, defaultValue, system, defaultValueUnit, to]);

  const hookFormUnit = hookFromWatch(displayUnitName, { value: displayUnit })?.value;
  useEffect(() => {
    if (hookFormUnit && convert().describe(hookFormUnit)?.system !== system) {
      hookFormSetValue(displayUnitName, unitOptionMap[displayUnit]);
    }
  }, [hookFormUnit]);

  useEffect(() => {
    if (hookFormUnit && hookFormValue !== undefined) {
      setVisibleInputValue(
        roundToTwoDecimal(convert(hookFormValue).from(databaseUnit).to(hookFormUnit)),
      );
    }
  }, [hookFormUnit]);

  const [visibleInputValue, setVisibleInputValue] = useState(displayValue);
  useEffect(() => {
    if (!hookFormGetValue(displayUnitName)) {
      for (const option of options) {
        if (option.value === displayUnit) {
          hookFormSetValue(displayUnitName, option);
          break;
        }
      }
    }
  }, []);

  const hookFormValue = hookFromWatch(name, defaultValue);
  const inputOnChange = (e) => {
    setVisibleInputValue(e.target.value);
    mode === 'onChange' && inputOnBlur(e);
  };
  const inputOnBlur = (e) => {
    if (isNaN(e.target.value)) {
      hookFormSetError(name, {
        type: 'manual',
        message: t('UNIT.INVALID_NUMBER'),
      });
    } else if (required && e.target.value === '') {
      hookFormSetValue(name, '', { shouldValidate: true });
    } else if (e.target.value === '') {
      hookFormSetValue(name, undefined, { shouldValidate: true });
      setVisibleInputValue('');
    } else if (e.target.value > 1000000000) {
      hookFormSetError(name, {
        type: 'manual',
        message: t('UNIT.MAXIMUM'),
      });
    } else {
      hookFormSetValue(name, convert(e.target.value).from(hookFormUnit).to(databaseUnit), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  useEffect(() => {
    if (databaseUnit && hookFormUnit) {
      setVisibleInputValue(
        hookFormValue > 0 || hookFormValue === 0
          ? roundToTwoDecimal(convert(hookFormValue).from(databaseUnit).to(hookFormUnit))
          : '',
      );
    }
  }, [hookFormValue]);

  return (
    <div className={clsx(styles.container)} style={{ ...style, ...classes.container }}>
      {label && (
        <div className={styles.labelContainer}>
          <Label>
            {label}{' '}
            {optional && (
              <Label sm className={styles.sm}>
                {t('common:OPTIONAL')}
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
            transform: isSelectDisabled ? 'translate(-1px, 23px)' : 'translate(-62px, 23px)',
            lineHeight: '40px',
            cursor: 'pointer',
            zIndex: 2,
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
          onBlur={mode === 'onBlur' ? inputOnBlur : undefined}
          onChange={inputOnChange}
          onWheel={preventNumberScrolling}
          {...props}
        />

        <Controller
          control={control}
          name={displayUnitName}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              onBlur={onBlur}
              onChange={(e) => {
                onChange(e);
              }}
              value={value}
              inputRef={ref}
              customStyles
              styles={reactSelectStyles}
              isSearchable={false}
              options={options}
              isDisabled={isSelectDisabled}
            />
          )}
        />
        <div
          className={clsx(
            styles.pseudoInputContainer,
            errors && styles.inputError,
            isSelectDisabled && disabled && styles.disableBackground,
            attached && styles.noBorderRadius,
          )}
        >
          <div
            className={clsx(
              styles.verticleDivider,
              errors && styles.inputError,
              isSelectDisabled && styles.none,
            )}
          />
        </div>
      </div>
      <input
        className={styles.hiddenInput}
        defaultValue={defaultValue || hookFormValue || ''}
        {...register(name, { required, valueAsNumber: true })}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <Error style={{ position: 'relative', ...classes.errors }}>{errors?.message}</Error>
      ) : null}
    </div>
  );
};

Unit.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  optional: PropTypes.bool,
  info: PropTypes.string,
  errors: PropTypes.object,
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
  hookFromWatch: PropTypes.func,
  name: PropTypes.string,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  mode: PropTypes.oneOf(['onBlur', 'onChange']),
  unitType: PropTypes.shape({
    metric: PropTypes.object,
    imperial: PropTypes.object,
    databaseUnit: PropTypes.string,
  }).isRequired,
  from: PropTypes.string,
  to: PropTypes.string,
  required: PropTypes.bool,
};

export default Unit;
