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
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  getWeatherSuccess,
  onLoadingWeatherFail,
  onLoadingWeatherStart,
  weatherSelector,
} from './weatherSlice';
import { createAction } from '@reduxjs/toolkit';
import { userFarmSelector } from '../userFarmSlice';
import utils from './utils';
import { axios } from '../saga';

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
      const apikey = import.meta.env.OPEN_WEATHER_APP_ID;
      const params = {
        ...args,
        appid: apikey,
        cnt: 1,
        lang: lang,
        units: measurement,
        lat: lat,
        lon: lon,
      };

      const openWeatherUrl = new URL(
        'https://api.openweathermap.org/data/2.5/weather'
      );
      for (const key in params) {
        openWeatherUrl.searchParams.append(key, params[key]);
      }
      const weatherRes = yield call(axios.get, openWeatherUrl.toString());
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
