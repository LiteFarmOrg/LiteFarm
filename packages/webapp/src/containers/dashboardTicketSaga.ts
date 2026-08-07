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

import { createAction } from '@reduxjs/toolkit';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { loginUrl } from '../apiConfig';
import { axios } from './saga';
import i18n from '../locales/i18n';
import { enqueueErrorSnackbar } from './Snackbar/snackbarSlice';
import { getAccessToken } from '../util/jwt';
import { buildDashboardTicketUrl } from '../util/dashboardTicket';
import { dashboardHandOffEnded, dashboardReturnToSelector } from './dashboardTicketSlice';

const dashboardTicketUrl = () => `${loginUrl}/dashboard/ticket`;

interface DashboardTicket {
  ticket: string;
  return_to: string;
}

/**
 * The endpoint needs neither `user_id` nor `farm_id`, so the header is built here instead
 * of with `getHeader`. The user is read from the access token by the API.
 */
export async function requestDashboardTicket(returnTo: string): Promise<DashboardTicket> {
  const header = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getAccessToken(),
    },
  };
  const response = await axios.post(dashboardTicketUrl(), { return_to: returnTo }, header);
  return response.data;
}

export function navigateToDashboard(url: string) {
  window.location.replace(url);
}

/**
 * Requests a ticket and sends the browser to the Analytics Dashboard when the user arrived
 * with a return address. Returns true when it has navigated away, false when the caller
 * should continue to its ordinary destination.
 */
export function* handOffToDashboardIfRequested() {
  const returnTo: string | null = yield select(dashboardReturnToSelector);

  if (!returnTo) {
    return false;
  }

  try {
    const { ticket, return_to }: DashboardTicket = yield call(requestDashboardTicket, returnTo);
    yield put(dashboardHandOffEnded());
    // Navigate to the address the API returned, so the browser is only ever sent
    // somewhere the server approved.
    yield call(navigateToDashboard, buildDashboardTicketUrl(return_to, ticket));
    return true;
  } catch (e) {
    console.error(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:LOGIN.ERROR.DASHBOARD_TICKET')));
    yield put(dashboardHandOffEnded());
    return false;
  }
}

export const handOffToDashboard = createAction('handOffToDashboardSaga');

export default function* dashboardTicketSaga() {
  yield takeLeading(handOffToDashboard.type, handOffToDashboardIfRequested);
}
