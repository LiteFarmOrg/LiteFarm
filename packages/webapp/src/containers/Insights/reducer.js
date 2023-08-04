/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import {
  SET_SOLD_OM_DATA,
  SET_LABOUR_HAPPINESS_DATA,
  SET_BIODIVERSITY_DATA,
  SET_BIODIVERSITY_LOADING,
  SET_PRICES_DATA,
  SET_PRICES_DISTANCE,
  SET_BIODIVERSITY_ERROR,
} from './constants';

const initialState = {
  soilOMData: { preview: 0, data: [] },
  labourHappinessData: { preview: 0, data: [] },
  biodiversityData: { preview: 0, data: [] },
  biodiversityLoading: false,
  biodiversityError: false,
  pricesData: { preview: 0, amountOfFarms: 0, data: [] },
  pricesDistance: 5,
};

function insightReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SOLD_OM_DATA:
      return Object.assign({}, state, {
        soilOMData: action.soilOMData,
      });

    case SET_LABOUR_HAPPINESS_DATA:
      return Object.assign({}, state, {
        labourHappinessData: action.labourHappinessData,
      });

    case SET_BIODIVERSITY_DATA:
      return Object.assign({}, state, {
        biodiversityData: action.biodiversityData,
      });

    case SET_BIODIVERSITY_LOADING:
      return Object.assign({}, state, {
        biodiversityLoading: action.biodiversityLoading,
      });

    case SET_BIODIVERSITY_ERROR:
      return Object.assign({}, state, {
        biodiversityError: action.biodiversityError,
        biodiversityData: {
          ...state.biodiversityData,
          timeFetched: action.timeFailed,
        },
      });

    case SET_PRICES_DATA:
      return Object.assign({}, state, {
        pricesData: action.pricesData,
      });

    case SET_PRICES_DISTANCE:
      return Object.assign({}, state, {
        pricesDistance: action.distance,
      });

    default:
      return state;
  }
}

export default insightReducer;
