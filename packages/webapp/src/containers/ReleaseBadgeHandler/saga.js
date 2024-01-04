/*
 *  Copyright 2023 LiteFarm.org
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

import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';

const { releaseBadgeUrl } = apiConfig;

export const checkReleaseBadgeVersion = createAction(`checkReleaseBadgeVersionSaga`);

export function* checkReleaseBadgeVersionSaga({ payload }) {
  const { currentVersion, setShouldShowBadge } = payload;

  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, releaseBadgeUrl, header);

    const { app_version } = result.data;

    if (isVersionLessThan(app_version, currentVersion)) {
      yield put(setReleaseBadgeVersion(currentVersion));

      // Don't show badge on first visit
      if (app_version) {
        setShouldShowBadge(true);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export const setReleaseBadgeVersion = createAction(`setReleaseBadgeVersionSaga`);

export function* setReleaseBadgeVersionSaga({ payload }) {
  const { user_id, farm_id } = yield select(loginSelector);

  const header = getHeader(user_id, farm_id);

  const body = { app_version: payload };

  try {
    yield call(axios.patch, `${releaseBadgeUrl}`, body, header);
  } catch (e) {
    console.log(e);
  }
}

export default function* releaseBadgeSaga() {
  yield takeLatest(checkReleaseBadgeVersion.type, checkReleaseBadgeVersionSaga);
  yield takeLatest(setReleaseBadgeVersion.type, setReleaseBadgeVersionSaga);
}

/**
 * Compares two semantic version strings to determine if the first is less than the second.
 * Semantic versioning should be maintained for this to continue to function
 * See: https://stackoverflow.com/a/65687141
 *
 * @param {string|null} a - The first version string to compare (can be null)
 * @param {string} b - The second version string to compare.
 * @returns {boolean} - Returns `true` if the first version string is less than the second; otherwise, returns `false`.
 */

const isVersionLessThan = (a, b) => {
  return (a ?? '0.0.0').localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) === -1;
};
