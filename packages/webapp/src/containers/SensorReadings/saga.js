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
import moment from 'moment';
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
import { CURRENT_DATE_TIME, TEMPERATURE } from './constants';
import { getTemperatureValue } from '../../components/Map/PreviewPopup/utils.js';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

const sensorReadingsUrl = () => `${sensorUrl}/reading/visualization`;

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
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let predictedEndDate = new Date().setDate(currentDate.getDate() + 2);
    predictedEndDate = new Date(predictedEndDate).setHours(0, 0, 0, 0);
    predictedEndDate = predictedEndDate / 1000;

    let startDate = new Date().setDate(currentDate.getDate() - 3);
    startDate = new Date(startDate).setHours(0, 0, 0, 0);
    startDate = parseInt(+startDate / 1000);

    const start = parseInt(+new Date().setDate(new Date().getDate() - 4) / 1000);
    yield put(bulkSensorReadingsLoading());
    const apikey = import.meta.env.VITE_WEATHER_API_KEY;
    let params = {
      appid: apikey,
      lang: lang,
      units: measurement,
      type: HOUR,
      start: start,
      end: predictedEndDate,
    };

    const header = getHeader(farm_id);
    const endDate = moment(new Date().setDate(new Date().getDate() + 1)).format('MM-DD-YYYY');
    const postData = {
      farm_id,
      locationIds,
      readingType,
      endDate: endDate,
    };
    const result = yield call(axios.post, sensorReadingsUrl(), postData, header);
    const allSensorNames = result?.data?.sensorsPoints.map((s) => s.name);
    const centerPoint = findCenter(result?.data?.sensorsPoints.map((s) => s?.point));
    const activeReadingTypes = result?.data?.sensorsPoints[0].reading_type;
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

    const [currentDayWeatherResponse, openWeatherResponse, predictedWeatherResponse] = yield all(
      openWeatherPromiseList,
    );
    const stationName = currentDayWeatherResponse?.data?.name;
    const weatherResData = [
      ...openWeatherResponse.data.list,
      ...predictedWeatherResponse.data.list,
    ];

    const currentDT = parseInt(+new Date() / 1000);
    let isFound = false;
    let predictedXAxisLabel = '';

    const ambientData = weatherResData.reduce((acc, tempInfo) => {
      let dateAndTimeInfo = new Date(tempInfo?.dt * 1000).toString();
      const isCorrectTimestamp = GRAPH_TIMESTAMPS?.find((g) => dateAndTimeInfo?.includes(g));
      if (isCorrectTimestamp && startDate < tempInfo?.dt && tempInfo?.dt < predictedEndDate) {
        const currentDateTime = `${dateAndTimeInfo?.split(':00:00')[0]}:00`;
        if (!isFound && currentDT < tempInfo?.dt) {
          isFound = true;
          predictedXAxisLabel = acc[Object.keys(acc).at(-1)][CURRENT_DATE_TIME];
        }
        if (!acc[tempInfo?.dt]) acc[tempInfo?.dt] = {};
        acc[tempInfo?.dt] = {
          ...acc[tempInfo?.dt],
          [`${ambientTempFor} ${stationName}`]: tempInfo?.main?.temp,
          [CURRENT_DATE_TIME]: currentDateTime,
        };
        for (const s of allSensorNames) {
          acc[tempInfo?.dt][s] = null;
        }
      }
      return acc;
    }, {});

    let ambientDataWithSensorsReadings = result?.data?.sensorReading.reduce((acc, cv) => {
      const dt = new Date(cv.read_time).valueOf() / 1000;
      let value = 0;
      if (readingType === TEMPERATURE) {
        value = getTemperatureValue(cv.value, measurement);
      }
      if (acc[dt] && dt < currentDT) {
        acc[dt][cv.name] = value;
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
    const lastUpdated = new Date(
      Math.max(
        ...Object.keys(ambientDataWithSensorsReadings)
          .filter((e) => e < currentDT)
          .map((e) => new Date(+e * 1000)),
      ),
    );
    const lastUpdatedReadingsTime = moment(lastUpdated).startOf('day').fromNow();

    let xAxisLabel = '';
    const allTimestamps = Object.keys(ambientDataWithSensorsReadings);
    if (allTimestamps.length) {
      const startDateObj = new Date(+allTimestamps[0] * 1000);
      const endDateObj = new Date(+allTimestamps.at(-1) * 1000);

      const language = getLanguageFromLocalStorage();
      const options = { month: 'short', day: '2-digit' };
      const dateTimeFormat = new Intl.DateTimeFormat(language, options);

      let startDateXAxisLabel = dateTimeFormat.format(startDateObj);
      let endDateXAxisLabel = dateTimeFormat.format(endDateObj);
      xAxisLabel = `${startDateXAxisLabel} - ${endDateXAxisLabel}`;
    }
    yield put(
      bulkSensorReadingsSuccess({
        sensorReadings: Object.values(ambientDataWithSensorsReadings),
        selectedSensorName,
        latestTemperatureReadings,
        nearestStationName: stationName,
        lastUpdatedReadingsTime,
        predictedXAxisLabel,
        xAxisLabel,
        activeReadingTypes,
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
