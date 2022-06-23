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
import { axios } from '../saga';
import { userFarmSelector } from '../userFarmSlice';
import { GRAPH_TIMESTAMPS, OPEN_WEATHER_API_URL_FOR_SENSORS, HOUR } from './constants';
import {
  bulkSensorReadingsLoading,
  bulkSensorReadingsSuccess,
  bulkSensorReadingsFailure,
} from '../bulkSensorReadingsSlice';

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
    const start = parseInt(+new Date().setDate(new Date().getDate() - 3) / 1000);
    const end = parseInt(+new Date() / 1000);

    const sensorsListAPIPromise = [];
    yield put(bulkSensorReadingsLoading());
    const apikey = import.meta.env.VITE_WEATHER_API_KEY;
    let params = {
      appid: apikey,
      lang: lang,
      units: measurement,
      type: HOUR,
      start,
      end,
    };
    for (const sensor of sensorsList) {
      params = {
        ...params,
        lat: sensor?.lat ?? lat,
        lon: sensor?.lon ?? lon,
      };
      const openWeatherUrl = new URL(OPEN_WEATHER_API_URL_FOR_SENSORS);
      for (const key in params) {
        openWeatherUrl.searchParams.append(key, params[key]);
      }
      sensorsListAPIPromise.push(call(axios.get, openWeatherUrl?.toString()));
    }

    const weatherResData = yield all(sensorsListAPIPromise);
    const status = weatherResData.every((wd) => wd?.status === 200 && wd?.statusText === 'OK');

    if (!status) {
      yield put(bulkSensorReadingsFailure());
      return;
    }

    const sensorsReadingForLineChart = weatherResData?.reduce((acc, singleAPIResponse, index) => {
      const sensorName = sensorsList[index]?.sensor_name;
      if (singleAPIResponse?.data?.list.length) {
        for (let tempInfo of singleAPIResponse.data.list) {
          let dateAndTimeInfo = new Date(tempInfo?.dt * 1000).toString();
          const isCorrectTimestamp = GRAPH_TIMESTAMPS?.find((g) => dateAndTimeInfo?.includes(g));
          if (isCorrectTimestamp) {
            if (!acc[tempInfo?.dt]) acc[tempInfo?.dt] = {};
            acc[tempInfo?.dt] = {
              ...acc[tempInfo?.dt],
              [sensorName]: tempInfo?.main?.temp,
              timestamp: tempInfo?.dt,
              dateAndTimeInfo: `${dateAndTimeInfo?.split(':00:00')[0]}:00`,
            };
          }
        }
      }
      return acc;
    }, {});
    yield put(bulkSensorReadingsSuccess(Object.values(sensorsReadingForLineChart)));
  } catch (error) {
    yield put(bulkSensorReadingsFailure());
    console.log(error);
  }
}

export default function* supportSaga() {
  yield takeLeading(getSensorsTempratureReadings.type, getSensorsTempratureReadingsSaga);
}
