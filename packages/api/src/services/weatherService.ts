/*
 *  Copyright 2025 LiteFarm.org
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

import axios, { AxiosError } from 'axios';
import credentials from '../credentials.js';
import endpoints from '../endPoints.js';

interface WeatherParams {
  lat: number;
  lon: number;
  units?: string;
}

interface WeatherData {
  humidity: number;
  icon: string;
  date: number;
  temp: number;
  wind: number;
  city: string;
  measurement: string;
}

const OPEN_WEATHER_APP_ID = credentials.OPEN_WEATHER_APP_ID;
const openWeatherAPI = endpoints.openWeatherAPI;

export const weatherService = {
  async getWeather({ lat, lon, units = 'metric' }: WeatherParams): Promise<WeatherData> {
    try {
      const url = `${openWeatherAPI}?units=${units}&lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_APP_ID}&lang=en&cnt=1`;
      const response = await axios.get(url);

      const data = await response.data;

      return {
        humidity: data.main.humidity,
        icon: data.weather[0].icon,
        date: data.dt,
        temp: Math.round(data.main.temp),
        wind: data.wind.speed,
        city: data.name,
        measurement: units,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw Object.assign(new Error('Failed to fetch weather data'), {
        status: axiosError.response?.status,
        details: axiosError.response?.data ?? axiosError.message,
      });
    }
  },
};

export default weatherService;
