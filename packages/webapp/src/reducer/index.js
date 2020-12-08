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
import { reducer as toastrReducer } from 'react-redux-toastr';
import logReducer from '../containers/Log/reducer';
import shiftReducer from '../containers/Shift/reducer';
import fieldReducer from '../containers/Field/reducer';
import insightReducer from '../containers/Insights/reducer';
import financeReducer from '../containers/Finances/reducer';
import farmReducer from '../containers/Profile/Farm/reducer';
import certifierSurveyReducer from '../containers/OrganicCertifierSurvey/slice';
import manualSignUpReducer from '../containers/CustomSignUp/signUpSlice';
import loginReducer from '../containers/loginSlice';
import userFarmReducer from '../containers/userFarmSlice';
import rolesReducer from '../containers/Profile/People/slice';

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
  loginReducer,
  userFarmReducer,
  // userReducer,
  certifierSurveyReducer,
  manualSignUpReducer,
  rolesReducer,
});

// combine all reducers here and pass it to application
const appReducer = combineReducers({
  toastr: toastrReducer,
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
  baseReducer,
  logReducer,
  shiftReducer,
  fieldReducer,
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
