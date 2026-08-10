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

import { api } from './apiSlice';
import { loginUrl } from '../../apiConfig';

interface DashboardTicket {
  ticket: string;
  return_to: string;
}

interface CreateDashboardTicketReqBody {
  return_to: string;
}

export const dashboardTicketApi = api.injectEndpoints({
  endpoints: (build) => ({
    createDashboardTicket: build.mutation<DashboardTicket, CreateDashboardTicketReqBody>({
      query: (body) => ({
        url: `${loginUrl}/dashboard/ticket`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateDashboardTicketMutation } = dashboardTicketApi;
