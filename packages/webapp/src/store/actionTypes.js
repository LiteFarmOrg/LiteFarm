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

import { createAction } from '@reduxjs/toolkit';

export const ActionTypes = {
  RESET_FARM_STATE: 'farmStateReducer/reset',
};

// Dispatched by clearOldFarmStateSaga on every in-session farm entry (switch, add, invite
// accept). rootReducer drops the farmStateReducer branch on this action so combineReducers
// re-initialises it.
export const resetFarmState = createAction(ActionTypes.RESET_FARM_STATE);
