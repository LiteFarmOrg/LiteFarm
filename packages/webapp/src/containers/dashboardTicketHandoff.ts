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

import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import i18n from '../locales/i18n';
import { store, RootState } from '../store/store';
import { dashboardTicketApi } from '../store/api/dashboardTicketApi';
import { buildDashboardTicketUrl } from '../util/dashboardTicket';
import { enqueueErrorSnackbar } from './Snackbar/snackbarSlice';
import { dashboardHandOffEnded, dashboardReturnToSelector } from './dashboardTicketSlice';

/**
 * Requests a ticket and sends the browser to the Analytics Dashboard when the user arrived
 * with a return address. Resolves true when it has navigated away, false when the caller
 * should continue to its ordinary destination.
 *
 * Reads the store directly rather than taking `dispatch` as an argument, so that a saga
 * (`yield call(handOffToDashboardIfRequested)`) and the arrival hook can share one call.
 */
export async function handOffToDashboardIfRequested(): Promise<boolean> {
  const returnTo = dashboardReturnToSelector(store.getState());

  if (!returnTo) {
    return false;
  }

  // store.ts annotates its middleware array as Middleware[], which reduces the store's
  // dispatch type to Dispatch<AnyAction>. Starting an RTK Query endpoint needs the thunk
  // signature that annotation discards.
  const dispatch = store.dispatch as ThunkDispatch<RootState, unknown, AnyAction>;

  const request = dispatch(
    dashboardTicketApi.endpoints.createDashboardTicket.initiate({ return_to: returnTo }),
  );

  try {
    const { ticket, return_to } = await request.unwrap();
    dispatch(dashboardHandOffEnded());
    // Navigate to the address the API returned, so the browser is only ever sent
    // somewhere the server approved.
    window.location.replace(buildDashboardTicketUrl(return_to, ticket));
    return true;
  } catch (e) {
    console.error(e);
    dispatch(enqueueErrorSnackbar(i18n.t('message:LOGIN.ERROR.DASHBOARD_TICKET')));
    dispatch(dashboardHandOffEnded());
    return false;
  } finally {
    // The whole store is persisted to localStorage, mutation results included. Dropping
    // the cache entry keeps the ticket out of storage.
    request.reset();
  }
}
