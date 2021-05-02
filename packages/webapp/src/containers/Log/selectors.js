/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (selectors.js) is part of LiteFarm.
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

import { createSelector } from 'reselect/es';

const logPageSelector = (state) => state.logReducer.logReducer;

const formStateSelector = (state) => state.logReducer.forms.forms;

const logSelector = createSelector(logPageSelector, (state) => state.logs);

const currentLogSelector = createSelector(logPageSelector, (state) => state.selectedLog);

const formDataSelector = createSelector(logPageSelector, (state) => state.formData);

const setAllHarvestUseTypesSelector = createSelector(logPageSelector, (state) => state.allUseType);

const selectedUseTypeSelector = createSelector(logPageSelector, (state) => state.useType);

const formValueSelector = createSelector(logPageSelector, (state) => state.formValue);

const startEndDateSelector = createSelector(logPageSelector, (state) => ({
  startDate: state.startDate,
  endDate: state.endDate,
}));

const logFieldFilterSelector = createSelector(logPageSelector, ({ fieldFilter }) => fieldFilter);

const logCropFilterSelector = createSelector(logPageSelector, ({ cropFilter }) => cropFilter);
const logTypeFilterSelector = createSelector(logPageSelector, ({ logType }) => logType);

const defaultDateSelector = createSelector(logPageSelector, (state) => state.defaultDate);

const harvestAllocationSelector = createSelector(
  logPageSelector,
  (state) => state.harvestAllocation,
);

const scoutingLogStateSelector = createSelector(formStateSelector, (state) => state.scoutingLog )
const pestControlLogStateSelector = createSelector(formStateSelector, (state) => state.pestControlLog )
const fieldWorkStateSelector = createSelector(formStateSelector, (state) => state.fieldWorkLog )
const harvestLogStateSelector = createSelector(formStateSelector, (state) => state.harvestLog )
const irrigationStateSelector = createSelector(formStateSelector, (state) => state.irrigationLog )
const otherLogStateSelector = createSelector(formStateSelector, (state) => state.otherLog )
const seedLogStateSelector = createSelector(formStateSelector, (state) => state.seedLog )
const soilDataLogStateSelector = createSelector(formStateSelector, (state) => state.soilDataLog )

export {
  logSelector,
  currentLogSelector,
  formDataSelector,
  selectedUseTypeSelector,
  setAllHarvestUseTypesSelector,
  formValueSelector,
  startEndDateSelector,
  defaultDateSelector,
  harvestAllocationSelector,
  logFieldFilterSelector,
  logCropFilterSelector,
  logTypeFilterSelector,
  scoutingLogStateSelector,
  pestControlLogStateSelector,
  fieldWorkStateSelector,
  harvestLogStateSelector,
  irrigationStateSelector,
  otherLogStateSelector,
  seedLogStateSelector,
  soilDataLogStateSelector
};
