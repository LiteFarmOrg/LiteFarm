/*
 *  Copyright 2026 LiteFarm.org
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

import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { url } from '../../apiConfig';
import { RootState } from '../store';

export const NON_JSON_ENDPOINT_KEYS = new Set(['addSupportTicket']);

export const BASE_QUERY = fetchBaseQuery({
  baseUrl: url,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState() as RootState;

    headers.set('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
    headers.set('user_id', state.entitiesReducer.userFarmReducer.user_id || '');
    headers.set('farm_id', state.entitiesReducer.userFarmReducer.farm_id || '');

    // Only set the content-type to json if appropriate.
    if (!NON_JSON_ENDPOINT_KEYS.has(endpoint) && !headers.has('Content-Type')) {
      headers.set('content-type', 'application/json');
    }

    return headers;
  },
  responseHandler: 'content-type',
});
