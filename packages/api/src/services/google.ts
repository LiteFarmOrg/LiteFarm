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
import { LiteFarmCustomError } from '../util/customErrors.js';

const { GOOGLE_API_KEY } = credentials;
const { googleWebRiskAPI } = endpoints;

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'SOCIAL_ENGINEERING_EXTENDED_COVERAGE',
];

// Web risk API https://cloud.google.com/web-risk/docs/lookup-api
export const isUriSafeByWebRisk = async (uri: string) => {
  const params = new URLSearchParams();
  THREAT_TYPES.forEach((type) => params.append('threatTypes', type));
  params.append('uri', uri);
  params.append('key', GOOGLE_API_KEY!);

  const url = `${googleWebRiskAPI}?${params.toString()}`;

  try {
    const { data } = await axios.get(url);

    // Web Risk API returns an empty object ({}) if the URI isn't on any threat lists
    return Object.keys(data).length === 0;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(axiosError);
    throw new LiteFarmCustomError('Web risk API call failed', 500);
  }
};
