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
 * Starts the hand-off to the Analytics Dashboard when the user arrived with a return address
 * and a LiteFarm session is already present.
 *
 * Returns true while the request is in flight, so the caller can render a Spinner in place of
 * the route tree. The initial value is computed during the first render, so the route tree is
 * never rendered before the redirect.
 */
export default function useDashboardHandoff(): boolean {
  const [isHandingOff, setIsHandingOff] = useState(
    () => !!getDashboardReturnTo() && isAuthenticated(),
  );

  useEffect(() => {
    if (!isHandingOff) {
      return;
    }

    // On success the browser leaves LiteFarm, so only a failure needs to release the route
    // tree, and it lands the user on their ordinary destination.
    handOffToDashboardIfRequested().then((handedOff) => {
      if (!handedOff) {
        setIsHandingOff(false);
      }
    });
  }, []);

  return isHandingOff;
}
