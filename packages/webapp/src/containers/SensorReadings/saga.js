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
import { axios, getHeader } from '../saga';
import { userFarmSelector } from '../userFarmSlice';
import {
  CHOSEN_GRAPH_DATAPOINTS,
  OPEN_WEATHER_API_URL_FOR_SENSORS,
  HOUR,
  SOIL_WATER_POTENTIAL,
  DAILY_FORECAST_API_URL,
} from './constants';
import {
  bulkSensorReadingsLoading,
  bulkSensorReadingsSuccess,
  bulkSensorReadingsFailure,
} from '../bulkSensorReadingsSlice';
import { sensorUrl } from '../../apiConfig';
import { findCenter } from './utils';
import { CURRENT_DATE_TIME, TEMPERATURE } from './constants';
import {
  getTemperatureValue,
  getSoilWaterPotentialValue,
} from '../../components/Map/PreviewPopup/utils.js';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { getLastUpdatedTime, getDates, roundDownToNearestChosenPoint } from './utils';
import i18n from '../../locales/i18n';

const sensorReadingsUrl = () => `${sensorUrl}/reading/visualization`;

const convertValues = (type, value, measurement) => {
  if (type === TEMPERATURE) {
    return getTemperatureValue(value, measurement);
  }
  if (type === SOIL_WATER_POTENTIAL) {
    return getSoilWaterPotentialValue(value, measurement);
  }
  return value;
};

export const getSensorsReadings = createAction(`getSensorsReadingsSaga`);

export function* getSensorsReadingsSaga({ payload }) {
  const { locationIds = [], readingTypes = [] } = payload;
  const {
    farm_id,
    user_id,
    units: { measurement },
    language_preference: lang,
    grid_points: { lat, lng },
  } = yield select(userFarmSelector);

  try {
    yield put(bulkSensorReadingsLoading());
    const { startUnixTime, endUnixTime, currentDateTime, formattedEndDate } = getDates();

    const header = getHeader(user_id, farm_id);
    const postData = {
      farm_id,
      user_id,
      locationIds,
      readingTypes,
      endDate: formattedEndDate,
    };

    const result = yield call(axios.post, sensorReadingsUrl(), postData, header);
    const data = result?.data;
    let sensorDataByLocationIds = {};

    for (let locationId of locationIds) {
      sensorDataByLocationIds[locationId] = {};
      for (let type of readingTypes) {
        sensorDataByLocationIds[locationId][type] = {};

        let readings = sensorDataByLocationIds[locationId][type];
        readings.selectedSensorName = data?.sensorsPoints[0]?.name;
        readings.lastUpdatedReadingsTime = getLastUpdatedTime(
          data?.sensorReading[type]
            .filter((cv) => (cv.value ? cv.value : cv.value === 0))
            .map((cv) => new Date(cv.actual_read_time).valueOf() / 1000),
        );
        readings.predictedXAxisLabel = roundDownToNearestChosenPoint(currentDateTime);

        // reduce sensor data
        let typeReadings = data?.sensorReading[type].reduce((acc, cv) => {
          const currentValueUnixTime = new Date(cv?.read_time).getTime() / 1000;
          const currentValueUnixTimeMsString = new Date(currentValueUnixTime * 1000).toString();
          const matchingChosenTimestamp = CHOSEN_GRAPH_DATAPOINTS?.find((g) =>
            currentValueUnixTimeMsString?.includes(g),
          );
          if (
            matchingChosenTimestamp &&
            startUnixTime <= currentValueUnixTime &&
            currentValueUnixTime < endUnixTime
          ) {
            const currentDateTime = `${currentValueUnixTimeMsString?.split(':00:00')[0]}:00`;
            if (!acc[currentValueUnixTime]) acc[currentValueUnixTime] = {};
            acc[currentValueUnixTime] = {
              [cv?.name]: isNaN(convertValues(type, cv?.value, measurement))
                ? i18n.t('translation:SENSOR.NO_DATA')
                : convertValues(type, cv?.value, measurement),
              [CURRENT_DATE_TIME]: currentDateTime,
            };
          }
          return acc;
        }, {});
        if (type === TEMPERATURE) {
          // Call OpenWeather
          const centerPoint = findCenter(data?.sensorsPoints.map((s) => s?.point));
          const params = {
            appid: import.meta.env.VITE_WEATHER_API_KEY,
            lang: lang,
            units: measurement,
            type: HOUR,
            start: startUnixTime,
            end: endUnixTime,
            lat: centerPoint?.lat ?? lat,
            lon: centerPoint?.lng ?? lng,
          };
          const openWeatherPromiseList = [];
          for (const weatherURL of OPEN_WEATHER_API_URL_FOR_SENSORS) {
            const openWeatherUrl = new URL(weatherURL);
            for (const key in params) {
              openWeatherUrl.searchParams.append(key, params[key]);
            }
            if (weatherURL === DAILY_FORECAST_API_URL) {
              openWeatherUrl.searchParams.append('cnt', 1);
            }
            openWeatherPromiseList.push(call(axios.get, openWeatherUrl?.toString()));
          }
          const [openWeatherResponse, predictedWeatherResponse, predictedDailyWeatherResponse] =
            yield all(openWeatherPromiseList);

          readings.stationName = predictedDailyWeatherResponse?.data?.city.name;
          readings.latestTemperatureReadings = {
            tempMin: predictedDailyWeatherResponse?.data?.list?.[0]?.temp?.min,
            tempMax: predictedDailyWeatherResponse?.data?.list?.[0]?.temp?.max,
          };

          // Reduce weather data
          const weatherResData = [
            ...openWeatherResponse.data.list,
            ...predictedWeatherResponse.data.list,
          ];
          typeReadings = weatherResData.reduce((acc, cv) => {
            const currentValueUnixTime = cv?.dt;
            if (acc[currentValueUnixTime]) {
              acc[currentValueUnixTime] = {
                ...acc[currentValueUnixTime],
                [`${readings.stationName}`]: cv?.main?.temp,
              };
            }
            return acc;
          }, typeReadings);
        }

        // Set readings based values
        const allTimestamps = Object.keys(typeReadings);
        if (allTimestamps.length) {
          const startDateObj = new Date(+allTimestamps[0] * 1000);
          const endDateObj = new Date(+allTimestamps.at(-1) * 1000);

          const language = getLanguageFromLocalStorage();
          const options = { month: 'short', day: '2-digit' };
          const dateTimeFormat = new Intl.DateTimeFormat(language, options);

          let startDateXAxisLabel = dateTimeFormat.format(startDateObj);
          let endDateXAxisLabel = dateTimeFormat.format(endDateObj);
          readings.xAxisLabel = `${startDateXAxisLabel} - ${endDateXAxisLabel}`;
        }
        readings.sensorReadingData = Object.values(typeReadings);
      }
    }

    yield put(
      bulkSensorReadingsSuccess({
        sensorDataByLocationIds,
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
