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
import { isAuthenticated } from '../../util/jwt';
import { getDashboardReturnTo } from '../dashboardReturnTo';
import { handOffToDashboardIfRequested } from '../dashboardTicketHandoff';

/**
 * Starts the hand-off to the Analytics Dashboard when the user arrived with a return address and
 * is already signed in.
 *
 * Returns true until the ticket request finishes, so the caller can render a Spinner instead of a
 * route. The first value is computed during the first render, so no route renders before the
 * redirect.
 */
export default function useDashboardHandoff(): boolean {
  const [isHandingOff, setIsHandingOff] = useState(
    () => !!getDashboardReturnTo() && isAuthenticated(),
  );

  useEffect(() => {
    if (!isHandingOff) {
      return;
    }

    // On success the browser has already left LiteFarm, so only a failure stops the Spinner
    handOffToDashboardIfRequested().then((handedOff) => {
      if (!handedOff) {
        setIsHandingOff(false);
      }
    });
  }, []);

  return isHandingOff;
}
