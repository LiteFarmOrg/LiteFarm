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
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  onLoadingWeatherFail,
  onLoadingWeatherStart,
  getWeatherSuccess,
  weatherSelector,
} from './weatherSlice';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../lang/i18n';
import { loginSelector, userFarmSelector } from '../userFarmSlice';
import utils from './utils';

const axios = require('axios');

export const getWeather = createAction('getWeatherSaga');

export function* getWeatherSaga({ payload: args }) {
  const {
    farm_id,
    units: { measurement },
    language_preference: lang,
    grid_points: { lat, lng: lon },
  } = yield select(userFarmSelector);
  try {
    const weather = yield select(weatherSelector);
    const { lastActiveDatetime } = weather || {};
    const twoHour = 2000 * 3600;
    const currentDateTime = new Date().getTime();
    if (
      currentDateTime - lastActiveDatetime > twoHour ||
      !lastActiveDatetime ||
      measurement !== weather?.measurement
    ) {
      yield put(onLoadingWeatherStart(farm_id));
      const apikey = process.env.REACT_APP_WEATHER_API_KEY;
      const baseUri = '//api.openweathermap.org/data/2.5';
      const params = {
        ...args,
        appid: apikey,
        cnt: 1,
        lang: lang,
        units: measurement,
        lat: lat,
        lon: lon,
      };
      const endPointToday = `${baseUri}/weather`;
      const weatherRes = yield call(axios.get, endPointToday, { params });
      const weatherResData = weatherRes.data;
      const weatherPayload = {
        humidity: `${weatherResData.main?.humidity}%`,
        iconName: utils.getIcon(weatherResData.weather[0]?.icon),
        date: weatherResData.dt,
        temperature: `${Math.round(weatherResData.main?.temp)}`,
        wind: `${weatherResData.wind?.speed}`,
        city: weatherResData.name,
        measurement,
        farm_id,
      };
      yield put(getWeatherSuccess(weatherPayload));
    }
  } catch (error) {
    yield put(onLoadingWeatherFail({ error, farm_id }));
    console.log(error);
  }
}

export default function* weatherSaga() {
  yield takeLatest(getWeather.type, getWeatherSaga);
}
