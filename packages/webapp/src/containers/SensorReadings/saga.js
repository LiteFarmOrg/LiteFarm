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
import { sensorUrl } from '../../apiConfig';
import { getHeader } from '../../containers/saga';
import { findCenter } from './utils';
import { AMBIENT_TEMPERATURE, CURRENT_DATE_TIME } from './constants';

const sensorReadingsUrl = () => `${sensorUrl}/get_sensor_readings_for_visualization`;

export const getSensorsReadings = createAction(`getSensorsReadingsSaga`);

export function* getSensorsReadingsSaga({
  payload: locationIds = [],
  readingType = 'temperature',
}) {
  const {
    farm_id,
    units: { measurement },
    language_preference: lang,
    grid_points: { lat, lng },
  } = yield select(userFarmSelector);
  try {
    const start = parseInt(
      +new Date('06-26-2022').setDate(new Date('06-26-2022').getDate() - 4) / 1000,
    );
    const end = parseInt(+new Date('06-26-2022') / 1000);
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

    const header = getHeader(farm_id);

    const postData = {
      farm_id,
      locationIds,
      readingType,
      endDate: '06-27-2022',
    };
    const result = yield call(axios.post, sensorReadingsUrl(), postData, header);
    const centerPoint = findCenter(result?.data?.sensorsPoints.map((s) => s?.point));

    params = {
      ...params,
      lat: centerPoint?.lat ?? lat,
      lon: centerPoint?.lng ?? lng,
    };

    const openWeatherUrl = new URL(OPEN_WEATHER_API_URL_FOR_SENSORS);

    for (const key in params) {
      openWeatherUrl.searchParams.append(key, params[key]);
    }

    const openWeatherResponse = yield call(axios.get, openWeatherUrl?.toString());
    const weatherResData = openWeatherResponse.data.list;

    const ambientData = weatherResData.reduce((acc, tempInfo) => {
      let dateAndTimeInfo = new Date(tempInfo?.dt * 1000).toString();
      const isCorrectTimestamp = GRAPH_TIMESTAMPS?.find((g) => dateAndTimeInfo?.includes(g));
      if (isCorrectTimestamp) {
        if (!acc[tempInfo?.dt]) acc[tempInfo?.dt] = {};
        acc[tempInfo?.dt] = {
          ...acc[tempInfo?.dt],
          [AMBIENT_TEMPERATURE]: tempInfo?.main?.temp,
          [CURRENT_DATE_TIME]: `${dateAndTimeInfo?.split(':00:00')[0]}:00`,
        };
      }
      return acc;
    }, {});

    const ambientDataWithSensorsReadings = result.data.sensorReading.reduce((acc, cv) => {
      const dt = new Date(cv.read_time).valueOf() / 1000;
      if (acc[dt]) {
        acc[dt][cv.name] = cv.value;
      }
      return acc;
    }, ambientData);

    let selectedSensorName = '';
    if (result?.data?.sensorsPoints) {
      selectedSensorName = result?.data?.sensorsPoints[0]?.name;
    }

    const latestWeatherData = weatherResData?.at(-1);
    let latestTemperatureReadings = {};
    if (latestWeatherData) {
      latestTemperatureReadings = {
        tempMin: latestWeatherData?.main?.temp_min,
        tempMax: latestWeatherData?.main?.temp_max,
      };
    }

    yield put(
      bulkSensorReadingsSuccess({
        sensorReadings: Object.values(ambientDataWithSensorsReadings),
        selectedSensorName,
        latestTemperatureReadings,
      }),
    );
  } catch (error) {
    yield put(bulkSensorReadingsFailure());
    console.log(error);
  }
}

export default function* supportSaga() {
  yield takeLeading(getSensorsReadings.type, getSensorsReadingsSaga);
}
