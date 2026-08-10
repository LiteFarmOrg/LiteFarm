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
import { logout } from '../util/jwt';
import { enqueueErrorSnackbar } from './Snackbar/snackbarSlice';
import { clearDashboardReturnTo, getDashboardReturnTo } from './dashboardReturnTo';

/**
 * Requests a ticket and sends the browser to the Analytics Dashboard when the user arrived
 * with a return address. Resolves true when it has navigated away, false when the caller
 * should continue to its ordinary destination.
 */
export async function handOffToDashboardIfRequested(): Promise<boolean> {
  const returnTo = getDashboardReturnTo();

  if (!returnTo) {
    return false;
  }

  // store.ts types its middleware as Middleware[], which narrows store.dispatch to plain actions
  const dispatch = store.dispatch as ThunkDispatch<RootState, unknown, AnyAction>;

  const request = dispatch(
    dashboardTicketApi.endpoints.createDashboardTicket.initiate({ return_to: returnTo }),
  );

  try {
    const { ticket, return_to } = await request.unwrap();
    clearDashboardReturnTo();
    window.location.replace(buildDashboardTicketUrl(return_to, ticket));
    return true;
  } catch (e) {
    console.error(e);

    // Sign out, but keep the address so the sign-in that follows completes the hand-off
    if (typeof e === 'object' && e !== null && 'status' in e && e.status === 401) {
      logout();
      return false;
    }

    dispatch(enqueueErrorSnackbar(i18n.t('message:LOGIN.ERROR.DASHBOARD_TICKET')));
    clearDashboardReturnTo();
    return false;
  } finally {
    // The ticket is a credential, and a mutation result stays in the RTK Query cache until reset
    request.reset();
  }
}
