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

import { api } from './apiSlice';
import { weatherUrl } from '../../apiConfig';
import { WeatherData } from './types';
import { WEATHER_TAGS, ApiTag } from './apiTags';

export const weatherApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWeather: build.query<WeatherData, void>({
      query: () => `${weatherUrl}`,
      providesTags: (): ApiTag[] => [WEATHER_TAGS.WEATHER],
      keepUnusedDataFor: 7200, // Cache data for 2 hours (7200 seconds)
    }),
  }),
});

export const { useGetWeatherQuery } = weatherApi;
