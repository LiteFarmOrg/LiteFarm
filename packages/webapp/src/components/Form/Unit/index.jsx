/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import React, { useMemo } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { useTranslation } from 'react-i18next';
import { integerOnKeyDown, numberOnKeyDown, preventNumberScrolling } from '../Input';
import Select from 'react-select';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import { area_total_area } from '../../../util/convert-units/unit';
import Infoi from '../../Tooltip/Infoi';
import { Controller } from 'react-hook-form';
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';
import useUnit from './useUnit';

const getOnKeyDown = (measure) => {
  switch (measure) {
    case 'time':
      return integerOnKeyDown;
    default:
      return numberOnKeyDown;
  }
};

const DEFAULT_REACT_SELECT_WIDTH = 80;
const DEFAULT_SELECT_ARROW_ICON_WIDTH = 20;

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
        display: 'flex',
        justifyContent: 'center',
        background: disabled ? 'var(--inputDisabled)' : 'inherit',
      }),
      singleValue: (provided, state) => ({
        fontSize: '16px',
        lineHeight: '24px',
        color: state.isDisabled ? 'var(--grey600)' : 'var(--fontColor)',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontFamily: '"Open Sans", "SansSerif", serif',
        overflowX: 'hidden',
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
  optional = !required,
  mode = 'onBlur',
  max = 1000000000,
  toolTipContent,
  onChangeUnitOption = () => {},
  onBlur,
  hasLeaf,
  ...props
}) => {
  const { t } = useTranslation(['translation', 'common']);

  const {
    onClear,
    showError,
    options,
    isSelectDisabled,
    visibleInputValue,
    inputOnChange,
    getMax,
    measure,
    hookFormValue,
    inputOnBlur,
    isDirty,
    setDirty,
    error,
  } = useUnit({
    disabled,
    name,
    displayUnitName,
    hookFormSetValue,
    hookFormGetValue,
    hookFromWatch,
    defaultValue,
    system,
    control,
    unitType,
    from: defaultValueUnit,
    to,
    required,
    optional,
    mode,
    max,
  });

  const reactSelectWidth = getReactSelectWidth(measure);
  const reactSelectStyles = useReactSelectStyles(disabled, { reactSelectWidth });

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
            {hasLeaf && <Leaf className={styles.leaf} />}
          </Label>
          {toolTipContent && (
            <div className={styles.tooltipIconContainer}>
              <Infoi content={toolTipContent} />
            </div>
          )}
        </div>
      )}

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <input
            disabled={disabled}
            className={clsx(styles.input)}
            style={{ ...classes.input }}
            aria-invalid={showError ? 'true' : 'false'}
            type={'number'}
            value={visibleInputValue}
            size={1}
            onKeyDown={getOnKeyDown(measure)}
            onBlur={
              mode === 'onBlur'
                ? (e) => {
                    inputOnBlur(e);
                    onBlur && onBlur(e);
                  }
                : onBlur
            }
            onChange={inputOnChange}
            onWheel={preventNumberScrolling}
            {...props}
          />
          {showError && <Cross onClick={onClear} className={styles.crossWrapper} />}
        </div>

        <Controller
          control={control}
          name={displayUnitName}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              data-cy="unit-select"
              onBlur={onBlur}
              onChange={(e) => {
                onChange(e);
                onChangeUnitOption(e);
                if (!isDirty) setDirty(true);
              }}
              value={value}
              ref={ref}
              customStyles
              styles={reactSelectStyles}
              isSearchable={false}
              options={options}
              isDisabled={isSelectDisabled || disabled}
            />
          )}
        />
        <div className={clsx(styles.pseudoInputContainer, showError && styles.inputError)}>
          <div
            className={clsx(
              styles.verticleDivider,
              showError && styles.inputError,
              (isSelectDisabled || disabled) && styles.none,
            )}
            style={{
              width: `${
                isSelectDisabled
                  ? reactSelectWidth - DEFAULT_SELECT_ARROW_ICON_WIDTH
                  : reactSelectWidth
              }px`,
            }}
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
          min: { value: 0, message: t('UNIT.VALID_VALUE') + max },
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
  hasLeaf: PropTypes.bool,
};

export default Unit;
