/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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

import { combineReducers } from 'redux';
import baseReducer from '../containers/reducer';
import { combineForms } from 'react-redux-form';
import { PURGE } from 'redux-persist';
import logReducer from '../containers/Log/reducer';
import shiftReducer from '../containers/Shift/reducer';
import insightReducer from '../containers/Insights/reducer';
import financeReducer from '../containers/Finances/reducer';
import farmReducer from '../containers/Profile/Farm/reducer';
import certifierSurveyReducer from '../containers/OrganicCertifierSurvey/slice';
import userFarmReducer from '../containers/userFarmSlice';
import rolesReducer from '../containers/Profile/People/slice';
import userLogReducer from '../containers/userLogSlice';
import weatherReducer from '../containers/WeatherBoard/weatherSlice';
import chooseFarmFlowReducer from '../containers/ChooseFarm/chooseFarmFlowSlice';

import barnReducer from '../containers/barnSlice';
import ceremonialReducer from '../containers/ceremonialSlice';
import farmSiteBoundaryReducer from '../containers/farmSiteBoundarySlice';
import fieldReducer from '../containers/fieldSlice';
import gardenReducer from '../containers/gardenSlice';
import greenhouseReducer from '../containers/greenhouseSlice';
import surfaceWaterReducer from '../containers/surfaceWaterSlice';
import naturalAreaReducer from '../containers/naturalAreaSlice';
import residenceReducer from '../containers/residenceSlice';
import bufferZoneReducer from '../containers/bufferZoneSlice';
import watercourseReducer from '../containers/watercourseSlice';
import fenceReducer from '../containers/fenceSlice';
import gateReducer from '../containers/gateSlice';
import waterValveReducer from '../containers/waterValveSlice';

import shiftStepReducer from '../containers/shiftSlice';
import logSliceReducer from '../containers/Log/Utility/logSlice';
import cropReducer from '../containers/cropSlice';
import cropVarietyReducer from '../containers/cropVarietySlice';
import managementPlanReducer from '../containers/managementPlanSlice';
import taskReducer from '../containers/taskSlice';
import productReducer from '../containers/productSlice';
import homeReducer from '../containers/Home/homeSlice';
import mapLocationReducer from '../containers/mapSlice';
import mapFilterSettingReducer from '../containers/Map/mapFilterSettingSlice';
import showedSpotlightReducer from '../containers/showedSpotlightSlice';
import hookFormPersistReducer from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import filterReducer from '../containers/filterSlice';
import transplantContainerReducer from '../containers/transplantContainerSlice';
import containerReducer from '../containers/containerSlice';
import bedsReducer from '../containers/bedsSlice';
import rowsReducer from '../containers/rowsSlice';
import broadcastReducer from '../containers/broadcastSlice';
import documentReducer from '../containers/documentSlice';
import certificationReducer from '../containers/OrganicCertifierSurvey/certificationSlice';
import certifierReducer from '../containers/OrganicCertifierSurvey/certifierSlice';
import snackbarReducer from '../containers/Snackbar/snackbarSlice';
// all the initial state for the forms
const initialFarmState = {
  farm_name: '',
  address: '',
  gridPoints: {},
  unit: 'metric',
  currency: 'CAD',
  date: 'MM/DD/YY',
  sandbox: false,
};

const initialNotification = {
  alert_pest: true,
  alert_weather: true,
  alert_worker_finish: true,
  alert_before_planned_date: true,
  alert_action_after_scouting: true,
};

const initialUserInfo = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  address: '',
  profile_picture: '',
};

const initialFarmInfo = {
  farm_name: '',
  unit: 'metric',
  currency: 'CAD',
  date: 'MM/DD/YY',
  phone_number: '',
  phone_country: '',
  address: '',
  gridPoints: {},
};

const editUserInfo = {
  first_name: '',
  last_name: '',
  email: '',
  role: 'Worker',
  pay: {
    type: 'hourly',
    amount: 0,
  },
};

const addUserInfo = {
  first_name: '',
  last_name: '',
  email: '',
  role: 'Worker',
  pay: {
    type: '',
    amount: null,
  },
};

const signUpUserInfo = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
};

const entitiesReducer = combineReducers({
  userFarmReducer,
  // userReducer,
  certifierSurveyReducer,
  rolesReducer,
  cropReducer,
  cropVarietyReducer,
  managementPlanReducer,
  weatherReducer,
  barnReducer,
  ceremonialReducer,
  farmSiteBoundaryReducer,
  fieldReducer,
  gardenReducer,
  greenhouseReducer,
  surfaceWaterReducer,
  naturalAreaReducer,
  residenceReducer,
  bufferZoneReducer,
  watercourseReducer,
  fenceReducer,
  gateReducer,
  waterValveReducer,
  showedSpotlightReducer,
  transplantContainerReducer,
  containerReducer,
  bedsReducer,
  rowsReducer,
  broadcastReducer,
  documentReducer,
  certifierReducer,
  certificationReducer,
  taskReducer,
  productReducer
});

const persistedStateReducer = combineReducers({
  userLogReducer,
  chooseFarmFlowReducer,
  mapFilterSettingReducer,
});

const tempStateReducer = combineReducers({
  homeReducer,
  shiftStepReducer,
  logSliceReducer,
  mapLocationReducer,
  hookFormPersistReducer,
  filterReducer,
  snackbarReducer,
});

// combine all reducers here and pass it to application
const appReducer = combineReducers({
  profileForms: combineForms(
    {
      addInfo: addUserInfo,
      farm: initialFarmState,
      notification: initialNotification,
      userInfo: initialUserInfo,
      farmInfo: initialFarmInfo,
      editInfo: editUserInfo,
      signUpInfo: signUpUserInfo,
    },
    'profileForms',
  ),
  entitiesReducer,
  persistedStateReducer,
  tempStateReducer,
  baseReducer,
  logReducer,
  shiftReducer,
  insightReducer,
  financeReducer,
  farmReducer,
});

const rootReducer = (state, action) => {
  if (action.type === PURGE) {
    // clear redux state
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
