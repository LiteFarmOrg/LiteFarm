/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (reducer.js) is part of LiteFarm.
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
  SET_LOGS_IN_STATE,
  SET_SELECTED_LOG,
  SET_FORM_DATA,
  SET_SELECTED_USE_TYPES,
  SET_ALL_HARVEST_USE_TYPES,
} from './constants';
import { combineReducers } from 'redux';
import { combineForms } from 'react-redux-form';
import fertReducer from './FertilizingLog/reducer';
import pestControlReducer from './PestControlLog/reducer';

const initialState = {
  logs: null,
};

function logReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOGS_IN_STATE:
      return Object.assign({}, state, {
        logs: action.logs,
      });
    case SET_SELECTED_LOG:
      return Object.assign({}, state, {
        selectedLog: action.log,
      });
    case SET_FORM_DATA:
      return Object.assign({}, state, {
        formData: action.formData,
      });
    case SET_SELECTED_USE_TYPES:
      return Object.assign({}, state, {
        useType: action.useType,
      });
    case SET_ALL_HARVEST_USE_TYPES:
      return Object.assign({}, state, {
        allUseType: action.allUseType,
      });
    default:
      return state;
  }
}

const fertLog = {
  fert_id: null,
  quantity_kg: 0,
  notes: '',
  moisture_percentage: 0,
  n_percentage: 0,
  nh4_n_ppm: 0,
  p_percentage: 0,
  k_percentage: 0,
  field: null,
};

const irrigationLog = {
  activity_kind: 'irrigation',
  type: '',
  notes: '',
  flow_rate: null,
  unit: 'l/min',
  hours: null,
  field: null,
};

const scoutingLog = {
  activity_kind: 'scouting',
  type: '',
  notes: '',
  action_needed: false,
  field: null,
};

const fieldWorkLog = {
  type: null,
  notes: '',
  field: null,
};

const seedLog = {
  space_length: null,
  space_width: null,
  space_unit: null,
  rate: null,
  rate_unit: null,
  field: null,
};

const otherLog = {
  notes: '',
  field: null,
};

const harvestLog = {
  notes: '',
  field: null,
};

const harvestAllocation = {};

const pcLog = {
  quantity: 0,
  notes: '',
  custom_pesticide_name: '',
  custom_disease_scientific_name: '',
  custom_disease_common_name: '',
  custom_disease_group: 'Other',
  pesticide_id: null,
  disease_id: 1,
  type: '',
  entry_interval: 0,
  harvest_interval: 0,
  active_ingredients: '',
  concentration: 0,
  field: null,
};

export default combineReducers({
  forms: combineForms(
    {
      fertLog: fertLog,
      fieldWorkLog: fieldWorkLog,
      harvestLog: harvestLog,
      irrigationLog: irrigationLog,
      otherLog: otherLog,
      pestControlLog: pcLog,
      scoutingLog: scoutingLog,
      seedLog: seedLog,
      soilDataLog: {},
      harvestAllocation: harvestAllocation,
    },
    'logReducer.forms',
  ),
  logReducer,
  fertReducer,
  pestControlReducer,
});
