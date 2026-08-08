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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isAuthenticated } from '../../util/jwt';
import { getReturnToFromSearch } from '../../util/dashboardTicket';
import {
  dashboardHandOffStarted,
  isHandingOffToDashboardSelector,
  setDashboardReturnTo,
} from '../dashboardTicketSlice';
import { handOffToDashboardIfRequested } from '../dashboardTicketHandoff';

/**
 * Captures the Analytics Dashboard return address on arrival and, when a LiteFarm session
 * is already present, starts the hand-off at once.
 *
 * The address is read during render because `CustomSignUp` is a child of `Routes` and
 * replaces the location with one that carries no search string. React runs child effects
 * before parent effects, so an effect here would already see an empty search string.
 *
 * Returns true while the hand-off is in flight, so the caller can render a Spinner in
 * place of the route tree.
 */
export default function useDashboardHandoff(): boolean {
  const dispatch = useDispatch();
  const [returnTo] = useState(() => getReturnToFromSearch(window.location.search));
  const isHandingOff = useSelector(isHandingOffToDashboardSelector);

  useEffect(() => {
    // Written on every arrival, null included, so a value persisted by Redux Persist from
    // an earlier page load cannot reach a later ordinary sign-in.
    dispatch(setDashboardReturnTo(returnTo));

    if (returnTo && isAuthenticated()) {
      dispatch(dashboardHandOffStarted());
      handOffToDashboardIfRequested();
    }
  }, []);

  return isHandingOff;
}
