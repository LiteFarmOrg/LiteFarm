/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (actions.js) is part of LiteFarm.
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

import {
  ADD_HARVEST_USE_TYPE,
  GET_HARVEST_USE_TYPES,
  GET_LOGS,
  SAVE_HARVEST_ALLOCATION_WIP,
  SET_ALL_HARVEST_USE_TYPES,
  SET_DEFAULT_DATE,
  SET_DEFAULT_DATE_RANGE,
  SET_END_DATE,
  SET_FORM_DATA,
  SET_FORM_VALUE,
  SET_LOGS_IN_STATE,
  SET_SELECTED_LOG,
  SET_SELECTED_USE_TYPES,
  SET_START_DATE,
} from './constants';

export const getLogs = () => {
  return {
    type: GET_LOGS,
  };
};

export const setLogsInState = (logs) => {
  return {
    type: SET_LOGS_IN_STATE,
    logs,
  };
};

export const setSelectedLog = (log) => {
  return {
    type: SET_SELECTED_LOG,
    log,
  };
};

export const getHarvestUseTypes = () => {
  return {
    type: GET_HARVEST_USE_TYPES,
  };
};

export const setFormData = (formData) => {
  return {
    type: SET_FORM_DATA,
    formData,
  };
};

export const setAllHarvestUseTypes = (allUseType) => {
  return {
    type: SET_ALL_HARVEST_USE_TYPES,
    allUseType,
  };
};

export const setSelectedUseTypes = (useType) => {
  return {
    type: SET_SELECTED_USE_TYPES,
    useType,
  };
};

export const addHarvestUseType = (typeName) => {
  return {
    type: ADD_HARVEST_USE_TYPE,
    typeName,
  };
};

export const setFormValue = (formValue) => {
  return {
    type: SET_FORM_VALUE,
    formValue,
  };
};

export const setStartDate = (startDate) => {
  return {
    type: SET_START_DATE,
    startDate,
  };
};

export const setEndDate = (endDate) => {
  return {
    type: SET_END_DATE,
    endDate,
  };
};

export const setDefaultDateRange = () => {
  return {
    type: SET_DEFAULT_DATE_RANGE,
  };
};

export const setDefaultDate = (defaultDate) => {
  return {
    type: SET_DEFAULT_DATE,
    defaultDate,
  };
};

export const saveHarvestAllocationWip = (harvestAllocation) => {
  return {
    type: SAVE_HARVEST_ALLOCATION_WIP,
    harvestAllocation,
  };
};
