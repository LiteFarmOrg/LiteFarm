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
}

export interface WeatherForecastSlot {
  dt: number;
  tempC: number;
  iconCode: string;
  pop: number;
  rainMm3h: number;
  snowMm3h: number;
  windMs: number;
  humidity: number;
}

export interface WeatherForecast {
  city: { name: string; timezoneOffsetSeconds: number };
  slots: WeatherForecastSlot[];
}

interface OpenWeatherListEntry {
  dt: number;
  main: { temp: number; humidity: number };
  weather: { icon: string }[];
  wind: { speed: number };
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  pop?: number;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherListEntry[];
  city: { name: string; timezone: number };
}

const OPEN_WEATHER_APP_ID = credentials.OPEN_WEATHER_APP_ID;
const openWeatherAPI = endpoints.openWeatherAPI;

export const weatherService = {
  async fetchForecast({ lat, lon }: WeatherParams): Promise<WeatherForecast> {
    try {
      const url = `${openWeatherAPI}?units=metric&lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_APP_ID}&lang=en`;
      const response = await axios.get<OpenWeatherForecastResponse>(url);
      const data = response.data;

      return {
        city: {
          name: data.city.name,
          timezoneOffsetSeconds: data.city.timezone,
        },
        slots: data.list.map((entry) => ({
          dt: entry.dt,
          tempC: entry.main.temp,
          iconCode: entry.weather[0].icon,
          pop: entry.pop ?? 0,
          rainMm3h: entry.rain?.['3h'] ?? 0,
          snowMm3h: entry.snow?.['3h'] ?? 0,
          windMs: entry.wind.speed,
          humidity: entry.main.humidity,
        })),
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
