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

interface LegacyWeatherParams extends WeatherParams {
  units: string;
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

/**
 * Backward-compatible superset served from `GET /weather`.
 *
 * The legacy WeatherBoard bundle (still live in cached service workers) renders
 * `city` directly as a React child, so it must stay a string and the legacy
 * top-level fields must be present. `slots` is included so the WeatherForecast
 * bundle released alongside the new API does not crash in `groupSlotsByLocalDay`.
 * The clean shape lives at `GET /weather/forecast`.
 */
export interface LegacyWeatherCompat {
  city: string;
  temp: number;
  humidity: number;
  icon: string;
  date: number;
  wind: number;
  measurement: string;
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

async function fetchOpenWeatherForecast(
  lat: number,
  lon: number,
  units: string,
): Promise<OpenWeatherForecastResponse> {
  try {
    const url = `${openWeatherAPI}?units=${units}&lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_APP_ID}&lang=en`;
    const response = await axios.get<OpenWeatherForecastResponse>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw Object.assign(new Error('Failed to fetch weather data'), {
      status: axiosError.response?.status,
      details: axiosError.response?.data ?? axiosError.message,
    });
  }
}

function mapSlots(list: OpenWeatherListEntry[]): WeatherForecastSlot[] {
  return list.map((entry) => ({
    dt: entry.dt,
    tempC: entry.main.temp,
    iconCode: entry.weather[0].icon,
    pop: entry.pop ?? 0,
    rainMm3h: entry.rain?.['3h'] ?? 0,
    snowMm3h: entry.snow?.['3h'] ?? 0,
    windMs: entry.wind.speed,
    humidity: entry.main.humidity,
  }));
}

export const weatherService = {
  async fetchForecast({ lat, lon }: WeatherParams): Promise<WeatherForecast> {
    const data = await fetchOpenWeatherForecast(lat, lon, 'metric');

    return {
      city: {
        name: data.city.name,
        timezoneOffsetSeconds: data.city.timezone,
      },
      slots: mapSlots(data.list),
    };
  },

  async fetchLegacyForecast({
    lat,
    lon,
    units,
  }: LegacyWeatherParams): Promise<LegacyWeatherCompat> {
    const data = await fetchOpenWeatherForecast(lat, lon, units);
    const [first] = data.list;

    return {
      city: data.city.name,
      temp: Math.round(first.main.temp),
      humidity: first.main.humidity,
      icon: first.weather[0].icon,
      date: first.dt,
      wind: first.wind.speed,
      measurement: units,
      slots: mapSlots(data.list),
    };
  },
};

export default weatherService;
