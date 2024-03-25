/*
 *  Copyright 2023, 2024 LiteFarm.org
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

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  CROP_VARIETY_SALE,
  CROP_VARIETY_ID,
  QUANTITY,
  QUANTITY_UNIT,
  SALE_VALUE,
} from '../../components/Forms/GeneralRevenue/constants';
import { Error } from '../../components/Typography';
import CropSaleItem from '../../components/Forms/GeneralRevenue/CropSaleItem';
import { STATUS } from '../../components/Forms/GeneralRevenue/constants';
import { useTranslation } from 'react-i18next';
import styles from '../../components/Forms/GeneralRevenue/styles.module.scss';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../userFarmSlice';
import {
  allManagementPlansSelector,
  currentAndPlannedManagementPlansSelector,
} from '../managementPlanSlice';
import { createSelector } from 'reselect';
import { FilterMultiSelect } from '../../components/Filter/FilterMultiSelect';

/**
 * Reformat the sale data for ease of use with react-hook-forms.
 *
 * @param {Object} sale - The sale data object to be reformatted.
 * @returns {Object} An object where crop variety IDs are keys, and values contain properties:
 * - crop_variety_id: The unique identifier for the crop variety.
 * - quantity: The quantity of the crop variety sold.
 * - quantity_unit: The unit of measurement for the sold quantity.
 * - sale_value: The value of the crop variety sold.
 */
const reformatSaleData = (sale) => {
  // Reformat selector to match component format
  // TODO: match component to selector format
  return sale?.crop_variety_sale?.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: {
        crop_variety_id: cur.crop_variety_id,
        quantity: cur.quantity,
        quantity_unit: cur.quantity_unit,
        sale_value: cur.sale_value,
      },
    }),
    {},
  );
};

/**
 * Get filter options for crop varieties based on provided management plans and translations.
 *
 * This function generates an array of crop variety filter options using the provided
 * management plans and translation function. It ensures that the options are unique
 * based on crop variety IDs and sorts them alphabetically by label.
 *
 * @param {Object[]} managementPlans - An array of management plans containing crop variety data.
 * @param {Function} t - The translation function used to translate crop variety names.
 * @returns {Object[]} An array of crop variety filter options with unique crop variety IDs and translated labels.
 * Each option object contains:
 * - label: The translated label for the crop variety, formatted as "Crop Variety Name, Translated Crop Name".
 * - value: The unique identifier for the crop variety.
 */
const getCropVarietyFilterOptions = (managementPlans, t) => {
  if (!managementPlans || managementPlans.length === 0) {
    return [];
  }

  let cropVarietyFilterOptions = [];
  let cropVarietySet = new Set();

  for (let mp of managementPlans) {
    if (!cropVarietySet.has(mp.crop_variety_id)) {
      cropVarietyFilterOptions.push({
        label: mp.crop_variety_name
          ? `${mp.crop_variety_name}, ${t(`crop:${mp.crop_translation_key}`)}`
          : t(`crop:${mp.crop_translation_key}`),
        value: mp.crop_variety_id,
      });
      cropVarietySet.add(mp.crop_variety_id);
    }
  }

  cropVarietyFilterOptions.sort((a, b) => {
    if (a.label > b.label) {
      return 1;
    } else if (b.label > a.label) {
      return -1;
    } else {
      return 0;
    }
  });

  return cropVarietyFilterOptions;
};

/**
 * Get input components and unregister inactive options using provided data and functions.
 *
 * This function generates an array of input components for active options and unregisters
 * form fields related to inactive options using the provided management plans, system,
 * currency, React Hook Form functions, disabled input flag, active options, and inactive options.
 *
 * @param {Object[]} managementPlans - An array of management plans containing crop variety data.
 * @param {string} managementPlans[].crop_variety_id - The unique identifier for the crop variety.
 * @param {Object} system - The system configuration object.
 * @param {string} currency - The currency used for sale values.
 * @param {Object} reactHookFormFunctions - Functions provided by React Hook Form library for form management.
 * @param {boolean} disabledInput - A flag indicating whether the input fields should be disabled.
 * @param {Object[]} activeOptions - An array of active options for input components.
 * @param {Object[]} inactiveOptions - An array of inactive options for unregistering form fields.
 * @returns {React.Component[]} An array of input components for active options.
 */
const getInputs = (
  managementPlans,
  system,
  currency,
  reactHookFormFunctions,
  disabledInput,
  activeOptions,
  inactiveOptions,
) => {
  inactiveOptions?.forEach((option) => {
    const optionRegisterNames = [
      `${CROP_VARIETY_SALE}.${option.value}.${CROP_VARIETY_ID}`,
      `${CROP_VARIETY_SALE}.${option.value}.${SALE_VALUE}`,
      `${CROP_VARIETY_SALE}.${option.value}.${QUANTITY}`,
      `${CROP_VARIETY_SALE}.${option.value}.${QUANTITY_UNIT}`,
      `${CROP_VARIETY_SALE}.${option.value}`,
    ];

    reactHookFormFunctions.unregister(optionRegisterNames);
  });

  return activeOptions.map((c) => {
    const managementPlan = managementPlans.find((mp) => mp.crop_variety_id == c.value);
    return (
      <CropSaleItem
        key={c.label}
        managementPlan={managementPlan}
        system={system}
        currency={currency}
        reactHookFormFunctions={reactHookFormFunctions}
        cropVarietyId={c.value}
        disabledInput={disabledInput}
      />
    );
  });
};

/**
 * Get default values for custom form children based on the provided sale data.
 *
 * This function takes a sale object, reformats the sale data, and returns an object
 * containing default values for a react hook form custom form children. The default values are structured
 * using the CROP_VARIETY_SALE key, and the values are obtained from the reformatted sale data.
 *
 * @param {Object} sale - The sale data object to extract default values from.
 * @returns {Object} An object containing default values for custom form children.
 * The default values are structured as follows:
 * {
 *   [CROP_VARIETY_SALE]: {
 *     [crop_variety_id]: {
 *       crop_variety_id: number,
 *       quantity: number,
 *       quantity_unit: string,
 *       sale_value: number
 *     }
 *   }
 * }
 */
export const getCustomFormChildrenDefaultValues = (sale) => {
  const existingSales = reformatSaleData(sale);
  return {
    [CROP_VARIETY_SALE]: existingSales ?? undefined,
  };
};

/**
 * Custom hook for managing crop sale inputs and filters.
 *
 * This hook handles the logic for managing crop sale inputs and filters. It takes React Hook Form functions,
 * form type, sale data, currency, disabled input flag, and view mode as parameters and returns JSX elements
 * for crop sale inputs and filter selection.
 *
 * @param {Object} reactHookFormFunctions - Functions provided by React Hook Form library for form management.
 * @param {Object} sale - The sale data object containing crop variety sale information.
 * @param {string} currency - The currency used for sale values.
 * @param {boolean} disabledInput - A flag indicating whether the input fields should be disabled.
 * @param {Object[]} revenueTypes - The array of selectable revenue type options.
 * @param {Object} selectedTypeOption - The react select filter option that is currently selected.
 * @returns {JSX.Element|null} JSX elements for crop sale inputs and filter selection, or null if not a crop sale form.
 */

const selectManagementPlans = createSelector(
  [
    allManagementPlansSelector,
    currentAndPlannedManagementPlansSelector,
    (_, cropVarietySale = []) => cropVarietySale,
  ],
  (allManagementPlans, currentAndPlannedManagementPlans, cropVarietySale) => {
    const cropVarietyIds = new Set([
      ...cropVarietySale.map((sale) => sale.crop_variety_id),
      ...currentAndPlannedManagementPlans.map((mp) => mp.crop_variety_id),
    ]);
    return allManagementPlans.filter((mp) => cropVarietyIds.has(mp.crop_variety_id));
  },
);

export default function useCropSaleInputs(
  reactHookFormFunctions,
  sale,
  currency,
  disabledInput,
  revenueTypes,
  selectedTypeOption,
) {
  const { register, unregister, watch, getValues, setValue } = reactHookFormFunctions;
  const { t } = useTranslation();
  const managementPlans = useSelector((state) =>
    selectManagementPlans(state, sale?.crop_variety_sale),
  );
  const system = useSelector(measurementSelector);
  const selectedRevenueType = revenueTypes?.find(
    (t) => t.revenue_type_id === selectedTypeOption?.value,
  );

  const isCropSale = selectedRevenueType?.crop_generated;

  // Re-register to update 'required'
  useEffect(() => {
    // Maintain the value between registrations
    const currentValue = getValues(CROP_VARIETY_SALE);

    unregister(CROP_VARIETY_SALE);
    register(CROP_VARIETY_SALE, { required: isCropSale });

    setValue(CROP_VARIETY_SALE, currentValue);
  }, [isCropSale]);

  const chosenVarieties = watch(CROP_VARIETY_SALE);

  // If not memoized - useEffect dependency below causes infinite re-render of GeneralRevenue
  // when deselecting filter option
  const cropVarietyFilterOptions = useMemo(() => {
    return getCropVarietyFilterOptions(managementPlans, t);
  }, [managementPlans, t]);

  const existingSales = reformatSaleData(sale);

  // FilterMultiSelect details

  const [isDirty, setIsDirty] = useState(false);
  const [filterState, setFilterState] = useState({});
  const [isFilterValid, setIsFilterValid] = useState(true);

  const filter = {
    filterKey: STATUS,
    options: cropVarietyFilterOptions.map((cvs) => ({
      value: cvs.label,
      default: chosenVarieties?.[cvs.value] ? true : false,
      label: cvs.label,
    })),
  };

  const onFilter = (filterKey, state) => {
    setFilterState({ ...filterState, [filterKey]: state });
    setIsDirty(!isDirty);
  };

  const [fields, setFields] = useState(null);

  // For readonly/edit views
  useEffect(() => {
    if (existingSales) {
      const activeOptions = cropVarietyFilterOptions.filter((cvs) =>
        existingSales?.[cvs.value] ? true : false,
      );
      activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);
      const renderedFields = getInputs(
        managementPlans,
        system,
        currency,
        reactHookFormFunctions,
        disabledInput,
        activeOptions,
      );
      setFields(renderedFields);
    }
  }, []);

  useEffect(() => {
    if (filterState[STATUS]) {
      const activeOptions = cropVarietyFilterOptions.filter(
        (cvs) => filterState[STATUS][cvs.label].active,
      );
      const inactiveOptions = cropVarietyFilterOptions.filter(
        (cvs) => !filterState[STATUS][cvs.label].active,
      );
      activeOptions.length ? setIsFilterValid(true) : setIsFilterValid(false);
      const renderedFields = getInputs(
        managementPlans,
        system,
        currency,
        reactHookFormFunctions,
        disabledInput,
        activeOptions,
        inactiveOptions,
      );
      setFields(renderedFields);
    }
  }, [cropVarietyFilterOptions, filterState, isDirty, disabledInput]);

  return isCropSale ? (
    <>
      <FilterMultiSelect
        subject={t('SALE.ADD_SALE.CROP_VARIETY')}
        options={filter.options}
        filterKey={filter.filterKey}
        style={{ marginBottom: !isFilterValid ? '0' : '32px' }}
        key={filter.filterKey}
        onChange={onFilter}
        isDisabled={disabledInput}
      />
      {!isFilterValid && (
        <Error style={{ marginBottom: '32px' }}>{t('SALE.ADD_SALE.CROP_REQUIRED')}</Error>
      )}
      <hr className={styles.thinHr} />
      {fields}
    </>
  ) : null;
}
