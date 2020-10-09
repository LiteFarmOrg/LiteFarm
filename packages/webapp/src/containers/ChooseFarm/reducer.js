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
 SET_FARMS_BY_USER,
 UPDATE_CONSENT_OF_FARM
} from './constants';

const initialState = {
  farms: null,
};

function userFarmReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FARMS_BY_USER:
      return Object.assign({}, state, {
        farms: action.farms,
      });
    case UPDATE_CONSENT_OF_FARM:
      let result = state.farms.map(farm => {
        if (farm.farm_id === action.farm_id) {
          return {
            ...farm,
            ...action.payload
          }
        } else {
          return farm;
        }
      });
      return Object.assign({}, state, {
        farms: result,
      });
    default:
      return state;
  }
}

export default userFarmReducer;
