/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader } from '../saga';
import { loginSelector } from '../userFarmSlice';
import { countrySelectOptionsSelector, getCountriesCodeSuccess } from '../countrySlice';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

export const getCountryCode = createAction('getCountryCodeSaga');

export function* getCountryCodeSaga() {
  const { countryUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const selectOptions = yield select(countrySelectOptionsSelector);
  const language = getLanguageFromLocalStorage();

  if (selectOptions[language]) {
    return;
  }

  try {
    const result = yield call(axios.get, `${countryUrl}/code/${language}`, header);
    if (result?.data) {
      const options = [];
      const map = {};
      result.data.forEach(({ id, country_code, country_name }) => {
        options.push({ label: country_name, value: country_code });
        map[id] = { country_code, [`country_name_${language}`]: country_name };
      });
      options.sort((a, b) => a.label.localeCompare(b.label));
      yield put(getCountriesCodeSuccess({ options, map, language }));
    }
  } catch (e) {
    console.log('failed to fetch countries from database');
  }
}

export default function* countrySaga() {
  yield takeLeading(getCountryCode.type, getCountryCodeSaga);
}
