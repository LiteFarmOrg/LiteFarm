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

import { combineForms } from 'react-redux-form';
import { combineReducers } from 'redux';
import { PURGE } from 'redux-persist';
import chooseFarmFlowReducer from '../containers/ChooseFarm/chooseFarmFlowSlice';
import financeReducer from '../containers/Finances/reducer';
import insightReducer from '../containers/Insights/reducer';
import alertReducer from '../containers/Navigation/Alert/alertSlice';
import certifierSurveyReducer from '../containers/OrganicCertifierSurvey/slice';
import rolesReducer from '../containers/Profile/People/slice';
import weatherReducer from '../containers/WeatherBoard/weatherSlice';
import notificationReducer from '../containers/notificationSlice';
import baseReducer from '../containers/reducer';
import userFarmReducer from '../containers/userFarmSlice';
import userLogReducer from '../containers/userLogSlice';

import barnReducer from '../containers/barnSlice';
import bufferZoneReducer from '../containers/bufferZoneSlice';
import ceremonialReducer from '../containers/ceremonialSlice';
import farmSiteBoundaryReducer from '../containers/farmSiteBoundarySlice';
import fenceReducer from '../containers/fenceSlice';
import fieldReducer from '../containers/fieldSlice';
import gardenReducer from '../containers/gardenSlice';
import gateReducer from '../containers/gateSlice';
import greenhouseReducer from '../containers/greenhouseSlice';
import naturalAreaReducer from '../containers/naturalAreaSlice';
import residenceReducer from '../containers/residenceSlice';
import sensorReducer from '../containers/sensorSlice';
import surfaceWaterReducer from '../containers/surfaceWaterSlice';
import waterValveReducer from '../containers/waterValveSlice';
import watercourseReducer from '../containers/watercourseSlice';

import homeReducer from '../containers/Home/homeSlice';
import mapAddDrawerReducer from '../containers/Map/mapAddDrawerSlice';
import mapCacheReducer from '../containers/Map/mapCacheSlice';
import mapFilterSettingReducer from '../containers/Map/mapFilterSettingSlice';
import mapSensorReducer from '../containers/Map/mapSensorSlice';
import certificationReducer from '../containers/OrganicCertifierSurvey/certificationSlice';
import certifierReducer from '../containers/OrganicCertifierSurvey/certifierSlice';
import snackbarReducer from '../containers/Snackbar/snackbarSlice';
import appSettingReducer from '../containers/appSettingSlice';
import bedMethodReducer from '../containers/bedMethodSlice';
import broadcastMethodReducer from '../containers/broadcastMethodSlice';
import bulkSensorsReadingsReducer from '../containers/bulkSensorReadingsSlice';
import bulkSensorsUploadReducer from '../containers/bulkSensorUploadSlice';
import containerMethodReducer from '../containers/containerMethodSlice';
import cropManagementPlanReducer from '../containers/cropManagementPlanSlice';
import cropReducer from '../containers/cropSlice';
import cropVarietyReducer from '../containers/cropVarietySlice';
import customSignUpReducer from '../containers/customSignUpSlice';
import documentReducer from '../containers/documentSlice';
import fieldWorkReducer from '../containers/fieldWorkSlice';
import filterReducer from '../containers/filterSlice';
import harvestUseTypeReducer from '../containers/harvestUseTypeSlice';
import hookFormPersistReducer from '../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import offlineDetectorReducer from '../containers/hooks/useOfflineDetector/offlineDetectorSlice';
import irrigationTaskTypesReducer from '../containers/irrigationTaskTypesSlice';
import managementPlanReducer from '../containers/managementPlanSlice';
import mapLocationReducer from '../containers/mapSlice';
import plantingManagementPlanReducer from '../containers/plantingManagementPlanSlice';
import productReducer from '../containers/productSlice';
import revenueTypeReducer from '../containers/revenueTypeSlice';
import rowMethodReducer from '../containers/rowMethodSlice';
import sensorReadingTypesReducer from '../containers/sensorReadingTypesSlice';
import showedSpotlightReducer from '../containers/showedSpotlightSlice';
import cleaningTaskReducer from '../containers/slice/taskSlice/cleaningTaskSlice';
import fieldWorkTaskReducer from '../containers/slice/taskSlice/fieldWorkTaskSlice';
import harvestTaskReducer from '../containers/slice/taskSlice/harvestTaskSlice';
import irrigationTaskReducer from '../containers/slice/taskSlice/irrigationTaskSlice';
import pestControlTaskReducer from '../containers/slice/taskSlice/pestControlTaskSlice';
import plantTaskReducer from '../containers/slice/taskSlice/plantTaskSlice';
import soilAmendmentTaskReducer from '../containers/slice/taskSlice/soilAmendmentTaskSlice';
import transplantTaskReducer from '../containers/slice/taskSlice/transplantTaskSlice';
import taskReducer from '../containers/taskSlice';
import taskTypeReducer from '../containers/taskTypeSlice';
import { api } from './api/apiSlice';

import { ActionTypes } from './actionTypes';
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
  weatherReducer,
  alertReducer,
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
  sensorReducer,
  showedSpotlightReducer,
  bulkSensorsUploadReducer,
  bulkSensorsReadingsReducer,
  managementPlanReducer,
  cropManagementPlanReducer,
  plantingManagementPlanReducer,
  containerMethodReducer,
  bedMethodReducer,
  rowMethodReducer,
  broadcastMethodReducer,
  documentReducer,
  certifierReducer,
  certificationReducer,
  taskReducer,
  cleaningTaskReducer,
  fieldWorkTaskReducer,
  harvestTaskReducer,
  pestControlTaskReducer,
  soilAmendmentTaskReducer,
  plantTaskReducer,
  transplantTaskReducer,
  taskTypeReducer,
  harvestUseTypeReducer,
  productReducer,
  mapAddDrawerReducer,
  fieldWorkReducer,
  irrigationTaskReducer,
  irrigationTaskTypesReducer,
  revenueTypeReducer,
});

const farmStateReducer = combineReducers({
  notificationReducer,
});

const persistedStateReducer = combineReducers({
  userLogReducer,
  chooseFarmFlowReducer,
  mapFilterSettingReducer,
  mapCacheReducer,
  mapSensorReducer,
  sensorReadingTypesReducer,
  appSettingReducer,
});

const tempStateReducer = combineReducers({
  homeReducer,
  mapLocationReducer,
  hookFormPersistReducer,
  filterReducer,
  snackbarReducer,
  customSignUpReducer,
  offlineDetectorReducer,
});

// combine all reducers here and pass it to application
const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
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
  farmStateReducer,
  persistedStateReducer,
  tempStateReducer,
  baseReducer,
  insightReducer,
  financeReducer,
});

const rootReducer = (state, action) => {
  if (state && action.type === ActionTypes.SWITCH_FARMS) {
    // selectively only reset farmStateReducer state when switching farms
    const { farmStateReducer, ...otherReducers } = state;
    state = otherReducers;
  }
  if (action.type === PURGE) {
    // clear redux state
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
