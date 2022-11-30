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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { axios } from '../../../containers/saga';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import {
  fieldWorkLoading,
  fieldWorkSuccess,
  fieldWorkFailure,
} from '../../../containers/fieldWorkSlice';
import { taskUrl } from '../../../apiConfig';
import { getHeader } from '../../../containers/saga';

const getFieldWorkTypesURL = (farm_id) => `${taskUrl}/get_field_work_types/${farm_id}`;

export const getFieldWorkTypes = createAction(`getFieldWorkTypesSaga`);

export function* getFieldWorkTypesSaga() {
  const { farm_id, user_id } = yield select(userFarmSelector);
  try {
    yield put(fieldWorkLoading());
    const header = getHeader(user_id, farm_id);
    const result = yield call(axios.get, getFieldWorkTypesURL(farm_id), header);
    yield put(fieldWorkSuccess({ fieldWorkTypes: result.data }));
  } catch (error) {
    yield put(fieldWorkFailure());
    console.log(error);
  }
}

export default function* fieldWorkTaskSaga() {
  yield takeLeading(getFieldWorkTypes.type, getFieldWorkTypesSaga);
}
