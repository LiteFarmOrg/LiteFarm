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

import { api } from '../../store/api/apiSlice';
import { axios } from '../saga';
import utils from './utils';

export const weatherApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWeather: build.query({
      queryFn: async (arg) => {
        const apikey = import.meta.env.VITE_WEATHER_API_KEY;
        const params = {
          ...arg,
          appid: apikey,
          cnt: 1,
        };

        const openWeatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
        for (const key in params) {
          openWeatherUrl.searchParams.append(key, params[key]);
        }

        try {
          const response = await axios.get(openWeatherUrl.toString());
          const data = response.data;

          const weatherPayload = {
            humidity: `${data.main?.humidity}%`,
            iconName: utils.getIcon(data.weather[0]?.icon),
            date: data.dt + data.timezone,
            temperature: `${Math.round(data.main?.temp)}`,
            wind: `${data.wind?.speed}`,
            city: data.name,
            measurement: arg.measurement,
            lastUpdated: Date.now(), // Store timestamp in RTK Query cache
          };

          return { data: weatherPayload };
        } catch (error) {
          return {
            error: {
              status: 400,
              statusText: 'Weather Api Error',
              data: 'Failed to fetch weather data',
            },
          };
        }
      },
      providesTags: ['Weather'],
    }),
  }),
});

export const { useGetWeatherQuery } = weatherApi;
