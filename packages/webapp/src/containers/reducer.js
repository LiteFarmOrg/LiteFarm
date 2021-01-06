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

import { SHOW_SPOTLIGHT } from './constants';

const initialState = {
  show_spotlight: false,
};

function baseReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_SPOTLIGHT:
      return Object.assign({}, state, {
        show_spotlight: action.show_spotlight,
      });
    default:
      return state;
  }
}

export default baseReducer;
