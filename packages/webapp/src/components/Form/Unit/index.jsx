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

import React, { useRef } from 'react';
import styles from './unit.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error, Info, Label } from '../../Typography';
import { Cross } from '../../Icons';
import { useTranslation } from 'react-i18next';
import { preventNumberScrolling } from '../Input';
import Select from 'react-select';
import { area_total_area } from '../../../util/convert-units/unit';
import Infoi from '../../Tooltip/Infoi';
import { Controller } from 'react-hook-form';
import { ReactComponent as Leaf } from '../../../assets/images/signUp/leaf.svg';
import useUnit from './useUnit';
import useReactSelectStyles from './useReactSelectStyles';
import useElementWidth from '../../hooks/useElementWidth';

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
  currency,
  from: defaultValueUnit,
  to,
  required,
  optional = !required,
  mode = 'onBlur',
  max = 1000000000,
  toolTipContent,
  onChangeUnitOption,
  onBlur,
  hasLeaf,
  autoConversion,
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
    defaultHiddenInputValue,
    inputOnBlur,
    error,
    onKeyDown,
    onChangeUnit,
    reactSelectWidth,
    dividerWidth,
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
    onBlur,
    onChangeUnitOption,
    autoConversion,
  });

  const reactSelectStyles = useReactSelectStyles(disabled, { reactSelectWidth });
  const testId = props['data-testid'] || 'unit';
  const currencyRef = useRef(null);
  const { elementWidth } = useElementWidth(currencyRef);

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
            <div>
              <Infoi content={toolTipContent} />
            </div>
          )}
        </div>
      )}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          {currency && (
            <div ref={currencyRef} className={styles.currency} data-testid={`${testId}-currency`}>
              {currency}
            </div>
          )}
          <input
            disabled={disabled}
            className={clsx(styles.input)}
            style={{
              paddingLeft: currency ? `${elementWidth + 12}px` : undefined,
              ...classes.input,
            }}
            aria-invalid={showError ? 'true' : 'false'}
            type={'number'}
            value={visibleInputValue}
            size={1}
            onKeyDown={onKeyDown}
            onBlur={inputOnBlur}
            onChange={inputOnChange}
            onWheel={preventNumberScrolling}
            data-testid={testId}
            {...props}
          />
          {showError && (
            <Cross
              onClick={onClear}
              className={styles.crossWrapper}
              data-testid={`${testId}-errorclearbutton`}
            />
          )}
        </div>
        <div data-testid={`${testId}-select`}>
          <Controller
            control={control}
            name={displayUnitName}
            render={({ field: { onBlur, value, ref } }) => (
              <Select
                data-cy="unit-select"
                onBlur={onBlur}
                onChange={onChangeUnit}
                value={value}
                ref={ref}
                customStyles
                styles={reactSelectStyles}
                isSearchable={false}
                options={options}
                isDisabled={isSelectDisabled}
              />
            )}
          />
        </div>
        <div className={clsx(styles.pseudoInputContainer, showError && styles.inputError)}>
          <div
            className={clsx(
              styles.verticleDivider,
              showError && styles.inputError,
              isSelectDisabled && styles.none,
            )}
            style={{ width: dividerWidth }}
          />
        </div>
      </div>
      <input
        className={styles.hiddenInput}
        defaultValue={defaultHiddenInputValue}
        type={'number'}
        {...register(name, {
          required: required && t('common:REQUIRED'),
          valueAsNumber: true,
          max: { value: getMax(), message: t('UNIT.VALID_VALUE') + max },
          min: { value: 0, message: t('UNIT.VALID_VALUE') + max },
        })}
        data-testid={`${testId}-hiddeninput`}
      />
      {info && !showError && <Info style={classes.info}>{info}</Info>}
      {showError ? (
        <Error
          style={{ position: 'relative', ...classes.errors }}
          data-testid={`${testId}-errormessage`}
        >
          {error?.message}
        </Error>
      ) : null}
    </div>
  );
};

Unit.propTypes = {
  /** whether the input is disabled */
  disabled: PropTypes.bool,
  /** label for the input */
  label: PropTypes.string,
  /** whether the input is optional */
  optional: PropTypes.bool,
  /** content shown below the input */
  info: PropTypes.string,
  /** objects to style elements */
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
    errors: PropTypes.object,
  }),
  /** object to style the container */
  style: PropTypes.object,
  /** setValue function returned by useForm */
  hookFormSetValue: PropTypes.func,
  /** getValues function returned by useForm */
  hookFormGetValue: PropTypes.func,
  /** watch function returned by useForm */
  hookFromWatch: PropTypes.func,
  /** register function returned by useForm */
  register: PropTypes.func,
  /** control function returned by useForm */
  control: PropTypes.object,
  /** name of the (hidden) input which is used to register */
  name: PropTypes.string,
  /** user's preferred farm unit system */
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  /** when to validate user inputs */
  mode: PropTypes.oneOf(['onBlur', 'onChange']),
  /** one of the objects defined in '/packages/webapp/src/util/convert-units/unit.js' */
  unitType: PropTypes.shape({
    metric: PropTypes.object,
    imperial: PropTypes.object,
    databaseUnit: PropTypes.string,
  }).isRequired,
  /** currency used in the farm's country */
  currency: PropTypes.string,
  /** databaseUnit */
  from: PropTypes.string,
  /** default display unit */
  to: PropTypes.string,
  /** whether the input is required */
  required: PropTypes.bool,
  /** content of the tooltip */
  toolTipContent: PropTypes.string,
  /** whether the input should have the leaf icon */
  hasLeaf: PropTypes.bool,
  /** name of the unit select */
  displayUnitName: PropTypes.string,
  /** default hidden value */
  defaultValue: PropTypes.number,
  /** the maximum number accepted */
  max: PropTypes.number,
  /** function called when unit option is changed */
  onChangeUnitOption: PropTypes.func,
  /** function called on blur */
  onBlur: PropTypes.func,
  /** testId used for component testing */
  'data-testid': PropTypes.string,
};

export default Unit;
