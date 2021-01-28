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

const logSelector = createSelector(logPageSelector, (state) => state.logs);

const currentLogSelector = createSelector(logPageSelector, (state) => state.selectedLog);

const formDataSelector = createSelector(logPageSelector, (state) => state.formData);

const setAllHarvestUseTypesSelector = createSelector(logPageSelector, (state) => state.allUseType);

const selectedUseTypeSelector = createSelector(logPageSelector, (state) => state.useType);

const formValueSelector = createSelector(logPageSelector, (state) => state.formValue);

const defaultDateSelector = createSelector(logPageSelector, (state) => state.defaultDate);

export {
  logSelector,
  currentLogSelector,
  formDataSelector,
  selectedUseTypeSelector,
  setAllHarvestUseTypesSelector,
  formValueSelector,
  defaultDateSelector,
};
