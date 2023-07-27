/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
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
import { call, select, takeLeading } from 'redux-saga/effects';
import { userFarmSelector } from '../userFarmSlice';
import { getUserFarmsSaga } from '../ChooseFarm/saga';
import { logout } from '../../util/jwt';

export const handle403 = createAction(`handle403Saga`);

export function* handle403Saga() {
  yield call(getUserFarmsSaga);
  const { has_consent, status } = yield select(userFarmSelector);
  if (has_consent || status !== 'Active') {
    logout();
  }
}

export default function* supportSaga() {
  yield takeLeading(handle403.type, handle403Saga);
}
