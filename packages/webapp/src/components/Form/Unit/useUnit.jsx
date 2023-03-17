/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { get, useFormState } from 'react-hook-form';
import { integerOnKeyDown, numberOnKeyDown } from '../Input';
import {
  area_total_area,
  getDefaultUnit,
  roundToTwoDecimal,
} from '../../../util/convert-units/unit';
import { convert } from '../../../util/convert-units/convert';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';

const DEFAULT_REACT_SELECT_WIDTH = 80;
const DEFAULT_SELECT_ARROW_ICON_WIDTH = 20;

const getOptions = (unitType = area_total_area, system) => {
  return unitType[system].units.map((unit) => getUnitOptionMap()[unit]);
};

const getOnKeyDown = (measure) => {
  return measure === 'time' ? integerOnKeyDown : numberOnKeyDown;
};

const getReactSelectWidth = (measure) => {
  return measure === 'time' ? 93 : DEFAULT_REACT_SELECT_WIDTH;
};

const noValue = (value) => (value !== 0 && !value) || isNaN(value);

const useUnit = ({
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
  autoConversion = false,
}) => {
  const onClear = () => {
    setVisibleInputValue('');
    hookFormSetHiddenValue('', { shouldClearError: !optional, shouldValidate: optional });
  };

  const [showError, setShowError] = useState(false);
  const [isDirty, setDirty] = useState(false);
  const { errors } = useFormState({ control });
  const error = get(errors, name);

  useEffect(() => {
    setShowError(!!error && !disabled && isDirty);
  }, [error]);

  // 1. Determine default visibleInputValue + default displayUnit.
  const {
    displayUnit: defaultDisplayUnit,
    displayValue: defaultVisibleInputValue,
    options,
    databaseUnit,
    defaultIsSelectDisabled,
    reactSelectWidth,
    dividerWidth,
    onKeyDown,
  } = useMemo(() => {
    const databaseUnit = defaultValueUnit ?? unitType.databaseUnit;
    const options = getOptions(unitType, system);
    const hookFormValue = hookFormGetValue(name); // get the value set from parent component
    const value = hookFormValue || (hookFormValue === 0 ? 0 : defaultValue);
    // hookFormGetValue(displayUnitName) could be 'm' or {lable: 'm', value: 'm'}
    let hookFormDisplayUnit = hookFormGetValue(displayUnitName); // get the unit set from parent component
    hookFormDisplayUnit = hookFormDisplayUnit?.value || hookFormDisplayUnit;
    const defaultIsSelectDisabled = options.length <= 1;
    const measure = convert().describe(databaseUnit)?.measure;
    const reactSelectWidth = getReactSelectWidth(measure);
    const onKeyDown = getOnKeyDown(measure);
    const dividerWidth = defaultIsSelectDisabled
      ? reactSelectWidth - DEFAULT_SELECT_ARROW_ICON_WIDTH
      : reactSelectWidth;
    const displayUnit = to || hookFormDisplayUnit;
    const values = {
      options,
      databaseUnit,
      defaultIsSelectDisabled,
      reactSelectWidth,
      dividerWidth,
      onKeyDown,
    };

    // read/edit: displayUnit has been set in parent component and it's identical with user's preferred unit system
    if (displayUnit && (measure === 'time' || convert().describe(displayUnit)?.system === system)) {
      return {
        ...values,
        displayUnit,
        displayValue: value && roundToTwoDecimal(convert(value).from(databaseUnit).to(displayUnit)),
      };
    }

    // system generated/create/unit system unmatch: let the function determine a unit based on the guidance
    return { ...values, ...getDefaultUnit(unitType, value, system, databaseUnit) };
  }, []);

  const hookFormUnitOption = hookFromWatch(displayUnitName);
  const hookFormUnit = hookFormUnitOption?.value;

  // 2. Set defaultDisplayUnit
  useEffect(() => {
    const unit = getUnitOptionMap()[defaultDisplayUnit];
    hookFormSetValue(displayUnitName, unit);
  }, []);

  // 3. set default visibleInputValue
  const [visibleInputValue, setVisibleInputValue] = useState(defaultVisibleInputValue);

  const hookFormValue = hookFromWatch(name, defaultValue);

  useEffect(() => {
    if (!hookFormUnit || noValue(hookFormValue)) {
      return;
    }

    // if autoConversion is true, update visible value. if false, update hidden value
    if (autoConversion) {
      setVisibleInputValue(
        roundToTwoDecimal(convert(hookFormValue).from(databaseUnit).to(hookFormUnit)),
      );
      //Trigger validation
      (hookFormValue === 0 || hookFormValue > 0) && hookFormSetHiddenValue(hookFormValue);
    } else {
      hookFormSetHiddenValue(convert(visibleInputValue).from(hookFormUnit).to(databaseUnit), {
        shouldDirty: true,
      });
    }
  }, [hookFormUnit]);

  const inputOnChange = (e) => {
    setVisibleInputValue(e.target.value);
    mode === 'onChange' && onBlurForHook(e);
  };

  const hookFormSetHiddenValue = useCallback(
    (value, { shouldDirty = false, shouldValidate = true, shouldClearError } = {}) => {
      //TODO: refactor location form pages to use hookForm default value and <HookFormPersistProvider/>
      if (!disabled) {
        hookFormSetValue(name, value, {
          shouldValidate: !shouldClearError && shouldValidate,
          shouldDirty,
        });
        shouldClearError && setShowError(false);
      }
    },
    [name],
  );

  const onBlurForHook = (e) => {
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
    if (!isDirty) setDirty(true);
  };

  const inputOnBlur = (e) => {
    if (mode === 'onBlur') {
      onBlurForHook(e);
    }
    // function from parent component
    if (onBlur) {
      onBlur(e);
    }
  };

  // set visible value when hidden input is updated from parent component
  // (this happens when the component shows a result of a calculation)
  useEffect(() => {
    if ((noValue(visibleInputValue) && noValue(hookFormValue)) || !databaseUnit || !hookFormUnit) {
      return;
    }

    const newValue = roundToTwoDecimal(convert(hookFormValue).from(databaseUnit).to(hookFormUnit));
    if (newValue !== visibleInputValue) {
      setVisibleInputValue(hookFormValue > 0 || hookFormValue === 0 ? newValue : '');
    }
  }, [hookFormValue]);

  const getMax = useCallback(() => {
    return hookFormUnit ? convert(max).from(hookFormUnit).to(databaseUnit) : max;
  }, [hookFormUnit, max, databaseUnit]);

  const onChangeUnit = (e) => {
    hookFormSetValue(displayUnitName, e);

    // function from parent component
    if (onChangeUnitOption) {
      onChangeUnitOption(e);
    }
    if (!isDirty) {
      setDirty(true);
    }
  };

  return {
    onClear,
    showError,
    options,
    isSelectDisabled: defaultIsSelectDisabled || disabled,
    visibleInputValue,
    inputOnChange,
    getMax,
    defaultHiddenInputValue: defaultValue || hookFormValue || '',
    inputOnBlur,
    error,
    onChangeUnit,
    reactSelectWidth,
    dividerWidth,
    onKeyDown,
  };
};

useUnit.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  displayUnitName: PropTypes.string,
  hookFormSetValue: PropTypes.func,
  hookFormGetValue: PropTypes.func,
  hookFromWatch: PropTypes.func,
  defaultValue: PropTypes.number,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  control: PropTypes.func,
  unitType: PropTypes.shape({
    metric: PropTypes.object,
    imperial: PropTypes.object,
    databaseUnit: PropTypes.string,
  }).isRequired,
  from: PropTypes.string,
  to: PropTypes.string,
  required: PropTypes.bool,
  optional: PropTypes.bool,
  mode: PropTypes.oneOf(['onBlur', 'onChange']),
  max: PropTypes.number,
};

export default useUnit;
