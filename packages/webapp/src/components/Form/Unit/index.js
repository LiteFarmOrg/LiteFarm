import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../../locales/i18n';
import { numberOnKeyDown, preventNumberScrolling } from '../Input';
import Select from 'react-select';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import convert from 'convert-units';
import { area_total_area, getDefaultUnit, roundToTwoDecimal } from '../../../util/unit';
import Infoi from '../../Tooltip/Infoi';
import { Controller, get, useFormState } from 'react-hook-form';

export const getUnitOptionMap = () => ({
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
  year: { label: i18n.t('UNIT.TIME.YEAR'), value: 'year' },
  week: { label: i18n.t('UNIT.TIME.WEEK'), value: 'week' },
  month: { label: i18n.t('UNIT.TIME.MONTH'), value: 'month' },
});

const getOptions = (unitType = area_total_area, system) => {
  return unitType[system].units.map((unit) => getUnitOptionMap()[unit]);
};

const DEFAULT_REACT_SELECT_WIDTH = 61;

const getReactSelectWidth = (measure) => {
  if (measure === 'time') return 93;
  return DEFAULT_REACT_SELECT_WIDTH;
};

const useReactSelectStyles = (disabled, { reactSelectWidth = DEFAULT_REACT_SELECT_WIDTH } = {}) => {
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
        width: `${reactSelectWidth - 19}px`,
        justifyContent: 'center',
      }),
      singleValue: (provided, state) => ({
        fontSize: '16px',
        lineHeight: '24px',
        color: state.isDisabled ? 'var(--grey600)' : 'var(--grey600)',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontFamily: '"Open Sans", "SansSerif", serif',
        width: `${reactSelectWidth - 19}px`,
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
    [disabled, reactSelectWidth],
  );
};
const Unit = ({
  disabled = false,
  classes = { container: {} },
  style = {},
  label,
  optional,
  info,
  register,
  name,
  displayUnitName,
  hookFormSetValue,
  hookFormGetValue,
  hookFromWatch,
  defaultValue,
  system,
  control,
  unitType = area_total_area,
  from: defaultValueUnit,
  to,
  required,
  mode = 'onBlur',
  max = 1000000000,
  toolTipContent,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);
  const onClear = () => {
    setVisibleInputValue('');
    hookFormSetHiddenValue('', { shouldClearError: true, shouldValidate: false });
  };

  const [showError, setShowError] = useState();
  const { errors } = useFormState({ control });
  const error = get(errors, name);

  useEffect(() => {
    setShowError(!!error && !disabled);
  }, [error]);

  const {
    displayUnit,
    displayValue,
    options,
    databaseUnit,
    isSelectDisabled,
    measure,
    reactSelectWidth,
  } = useMemo(() => {
    const databaseUnit = defaultValueUnit ?? unitType.databaseUnit;
    const options = getOptions(unitType, system);
    const hookFormValue = hookFormGetValue(name);
    const value = hookFormValue || (hookFormValue === 0 ? 0 : defaultValue);
    const isSelectDisabled = options.length <= 1;
    const measure = convert().describe(databaseUnit)?.measure;
    const reactSelectWidth = getReactSelectWidth(measure);
    return to && convert().describe(to)?.system === system
      ? {
          displayUnit: to,
          displayValue: defaultValue && roundToTwoDecimal(convert(value).from(databaseUnit).to(to)),
          options,
          databaseUnit,
          isSelectDisabled,
          measure,
          reactSelectWidth,
        }
      : {
          ...getDefaultUnit(unitType, value, system, databaseUnit),
          options,
          databaseUnit,
          isSelectDisabled,
          measure,
          reactSelectWidth,
        };
  }, [unitType, defaultValue, system, defaultValueUnit, to]);
  const reactSelectStyles = useReactSelectStyles(disabled, { reactSelectWidth });

  const hookFormUnit = hookFromWatch(displayUnitName, { value: displayUnit })?.value;
  useEffect(() => {
    if (hookFormUnit && convert().describe(hookFormUnit)?.system !== system) {
      hookFormSetValue(displayUnitName, getUnitOptionMap()[displayUnit]);
    }
  }, [hookFormUnit]);

  useEffect(() => {
    if (hookFormUnit && hookFormValue !== undefined) {
      setVisibleInputValue(
        roundToTwoDecimal(convert(hookFormValue).from(databaseUnit).to(hookFormUnit)),
      );
      (hookFormValue === 0 || hookFormValue > 0) && hookFormSetHiddenValue(hookFormValue);
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

  const hookFormSetHiddenValue = useCallback(
    (value, { shouldDirty = false, shouldClearError, shouldValidate = true } = {}) => {
      setTimeout(() => {
        hookFormSetValue(name, value, {
          shouldValidate,
          shouldDirty,
        });
        shouldClearError && setShowError(false);
      }, 0);
    },
    [name],
  );

  const inputOnBlur = (e) => {
    if (required && e.target.value === '') {
      hookFormSetHiddenValue('');
    } else if (e.target.value === '') {
      hookFormSetValue(name, '', { shouldValidate: true });
      setVisibleInputValue('');
    } else {
      hookFormSetHiddenValue(convert(e.target.value).from(hookFormUnit).to(databaseUnit), {
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

  const getMax = useCallback(() => {
    return hookFormUnit ? convert(max).from(hookFormUnit).to(databaseUnit) : max;
  }, [hookFormUnit, max, databaseUnit]);

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
          {toolTipContent && <Infoi content={toolTipContent} />}
        </div>
      )}
      {showError && (
        <Cross
          onClick={onClear}
          style={{
            position: 'absolute',
            right: 0,
            transform: isSelectDisabled
              ? 'translate(-1px, 23px)'
              : unitType.databaseUnit === 'week'
              ? 'translate(-95px, 23px)'
              : 'translate(-62px, 23px)',
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
          className={clsx(styles.input)}
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
            showError && styles.inputError,
            isSelectDisabled && disabled && styles.disableBackground,
          )}
        >
          <div
            className={clsx(
              styles.verticleDivider,
              showError && styles.inputError,
              isSelectDisabled && styles.none,
            )}
            style={{ width: `${reactSelectWidth}px` }}
          />
        </div>
      </div>
      <input
        className={styles.hiddenInput}
        defaultValue={defaultValue || hookFormValue || ''}
        type={'number'}
        {...register(name, {
          required: required && t('common:REQUIRED'),
          valueAsNumber: true,
          max: { value: getMax(), message: t('UNIT.VALID_VALUE') + max },
        })}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <Error style={{ position: 'relative', ...classes.errors }}>{error?.message}</Error>
      ) : null}
    </div>
  );
};

Unit.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  optional: PropTypes.bool,
  info: PropTypes.string,
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
  toolTipContent: PropTypes.string,
};

export default Unit;
