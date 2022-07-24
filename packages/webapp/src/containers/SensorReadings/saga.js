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

export function* getSensorsReadingsSaga({ payload }) {
  const {
    locationIds = [],
    readingType = 'temperature',
    noDataText = '',
    ambientTempFor = '',
  } = payload;
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
    const allSensorNames = result?.data?.sensorsPoints.map((s) => s.name);
    const centerPoint = findCenter(result?.data?.sensorsPoints.map((s) => s?.point));

    params = {
      ...params,
      lat: centerPoint?.lat ?? lat,
      lon: centerPoint?.lng ?? lng,
    };
    const openWeatherPromiseList = [];
    for (const weatherURL of OPEN_WEATHER_API_URL_FOR_SENSORS) {
      const openWeatherUrl = new URL(weatherURL);
      for (const key in params) {
        openWeatherUrl.searchParams.append(key, params[key]);
      }
      openWeatherPromiseList.push(call(axios.get, openWeatherUrl?.toString()));
    }

    const [currentDayWeatherResponse, openWeatherResponse] = yield all(openWeatherPromiseList);
    const stationName = currentDayWeatherResponse?.data?.name;
    const weatherResData = openWeatherResponse.data.list;

    const ambientData = weatherResData.reduce((acc, tempInfo) => {
      let dateAndTimeInfo = new Date(tempInfo?.dt * 1000).toString();
      const isCorrectTimestamp = GRAPH_TIMESTAMPS?.find((g) => dateAndTimeInfo?.includes(g));
      if (isCorrectTimestamp) {
        if (!acc[tempInfo?.dt]) acc[tempInfo?.dt] = {};
        acc[tempInfo?.dt] = {
          ...acc[tempInfo?.dt],
          [`${ambientTempFor} ${stationName}`]: tempInfo?.main?.temp,
          [CURRENT_DATE_TIME]: `${dateAndTimeInfo?.split(':00:00')[0]}:00`,
        };
        for (const s of allSensorNames) {
          acc[tempInfo?.dt][s] = null;
        }
      }
      return acc;
    }, {});

    let ambientDataWithSensorsReadings = result?.data?.sensorReading.reduce((acc, cv) => {
      const dt = new Date(cv.read_time).valueOf() / 1000;
      if (acc[dt]) {
        acc[dt][cv.name] = cv.value;
      }
      return acc;
    }, ambientData);

    ambientDataWithSensorsReadings = allSensorNames.reduce((acc, cv) => {
      if (Object.values(acc).every((ambientDataReading) => ambientDataReading[cv] === null)) {
        acc = Object.values(acc).map((ambientDataReading) => {
          delete ambientDataReading[cv];
          return {
            ...ambientDataReading,
            [`${cv} ${noDataText}`]: null,
          };
        });
      }
      return acc;
    }, ambientDataWithSensorsReadings);

    const latestTemperatureReadings = {
      tempMin: currentDayWeatherResponse?.data?.main?.temp_min,
      tempMax: currentDayWeatherResponse?.data?.main?.temp_max,
    };
    let selectedSensorName = '';
    if (result?.data?.sensorsPoints) {
      selectedSensorName = result?.data?.sensorsPoints[0]?.name;
    }

    yield put(
      bulkSensorReadingsSuccess({
        sensorReadings: Object.values(ambientDataWithSensorsReadings),
        selectedSensorName,
        latestTemperatureReadings,
        nearestStationName: stationName,
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
