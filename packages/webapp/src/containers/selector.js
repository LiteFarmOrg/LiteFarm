/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (selector.js) is part of LiteFarm.
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

import { createSelector } from 'reselect/es';

const baseSelector = (state) => state.baseReducer;

const userInfoSelector = createSelector(
  baseSelector,
  (state) => state.users
);

const farmSelector = createSelector(
  baseSelector,
  (state) => state.farm
);

const fieldSelector = createSelector(
  baseSelector,
  (state) => state.fields
);

const cropSelector = createSelector(
  baseSelector,
  (state) => (state.fieldCrops || []).slice().sort((a, b) => (
    a.crop_common_name.localeCompare(
      b.crop_common_name,
      'en',
      { sensitivity: 'base' },
    )
  )),
);


export {
  userInfoSelector,
  farmSelector,
  fieldSelector,
  cropSelector,
};
