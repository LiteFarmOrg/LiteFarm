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
  SET_USER_IN_STATE,
  SET_FARM_IN_STATE,
  SET_FIELDS_IN_STATE,
  SET_FIELD_CROPS_IN_STATE,
} from './constants';

const initialState = {
  users: null,
  farm: null,
  fields: null,
  fieldCrops: null,
  consent_version: null,
};

function baseReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER_IN_STATE:
      return Object.assign({}, state, { users: action.users });
    case SET_FARM_IN_STATE:
      return Object.assign({}, state, { farm: action.farm });
    case SET_FIELDS_IN_STATE:
      return Object.assign({}, state, {
        fields: action.fields,
      });
    case SET_FIELD_CROPS_IN_STATE:
      return Object.assign({}, state, {
        fieldCrops: action.fieldCrops,
      });
    default:
      return state
  }
}

export default baseReducer;
