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
import { call, put, select, takeLeading, all } from 'redux-saga/effects';
import { url, sensorUrl } from '../../apiConfig';
import i18n from '../../locales/i18n';
import { axios, getHeader } from '../saga';
import { userFarmSelector } from '../userFarmSlice';
import { weatherSelector } from '../WeatherBoard/weatherSlice';

import {
  resetBulkSensorReadingsStates,
  bulkSensorReadingsLoading,
  bulkSensorReadingsSuccess,
  bulkSensorReadingsFailure,
} from '../bulkSensorReadingsSlice';
// import { bulkSenorUploadErrorTypeEnum } from './constants';

import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

const sendMapToEmailUrl = (farm_id) => `${url}/export/map/farm/${farm_id}`;
const showedSpotlightUrl = () => `${url}/showed_spotlight`;
const bulkUploadSensorsInfoUrl = () => `${sensorUrl}/add_sensors`;

export const getSensorsTempratureReadings = createAction(`getSensorsTempratureReadingsSaga`);

export function* getSensorsTempratureReadingsSaga({ payload: sensorsList }) {
  console.log('action called');
  const {
    farm_id,
    units: { measurement },
    language_preference: lang,
    grid_points: { lat, lng: lon },
  } = yield select(userFarmSelector);
  try {
    console.log('farm_id', farm_id);
    console.log('measurement', measurement);
    console.log('lang', lang);
    console.log('lat', lat);
    console.log('lon', lon);
    const weather = yield select(weatherSelector);
    const { lastActiveDatetime } = weather || {};
    const twoHour = 2000 * 3600;
    const currentDateTime = new Date().getTime();
    const start = parseInt(+new Date().setDate(new Date().getDate() - 3) / 1000);
    const end = parseInt(+new Date() / 1000);

    const sensorsListAPIPromise = [];
    yield put(bulkSensorReadingsLoading());
    const apikey = import.meta.env.VITE_WEATHER_API_KEY;
    let params = {
      appid: '96ed495d24b25c8a0cb967a4ebc6a32e',
      lang: lang,
      units: measurement,
      type: 'hour',
      start,
      end,
    };
    for (const sensor of sensorsList) {
      params = {
        ...params,
        lat: sensor?.lat ?? lat,
        lon: sensor?.lon ?? lon,
      };
      const openWeatherUrl = new URL('https://history.openweathermap.org/data/2.5/history/city');
      for (const key in params) {
        openWeatherUrl.searchParams.append(key, params[key]);
      }
      sensorsListAPIPromise.push(call(axios.get, openWeatherUrl.toString()));
    }

    const weatherResData = yield all(sensorsListAPIPromise);
    const status = weatherResData.every((wd) => wd?.status === 200 && wd?.statusText === 'OK');

    if (!status) {
      yield put(bulkSensorReadingsFailure());
      return;
    }

    const sensorsReadingForLineChart = weatherResData.reduce((accP, cv, index) => {
      const sensorName = sensorsList[index].sensor_name;
      for (let _d of cv.data.list) {
        let current_date_time = new Date(_d?.dt * 1000).toString();
        const isCorrectTimestamp =
          current_date_time.includes('02:00:00') ||
          current_date_time.includes('08:00:00') ||
          current_date_time.includes('14:00:00') ||
          current_date_time.includes('20:00:00');
        if (isCorrectTimestamp) {
          if (!accP[_d?.dt]) accP[_d?.dt] = {};
          accP[_d?.dt] = {
            ...accP[_d?.dt],
            [sensorName]: _d?.main?.temp,
            timestamp: _d?.dt,
          };
        }
      }
      return accP;
    }, {});

    yield put(bulkSensorReadingsSuccess(Object.values(sensorsReadingForLineChart)));
  } catch (error) {
    // yield put(onLoadingWeatherFail({ error, farm_id }));
    console.log(error);
  }
}

export default function* supportSaga() {
  yield takeLeading(getSensorsTempratureReadings.type, getSensorsTempratureReadingsSaga);
}
