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

import { getReturnToFromSearch } from '../util/dashboardTicket';

/**
 * The Analytics Dashboard return address, read from the URL query string when this module first
 * loads. `CustomSignUp` later calls `history.replace` with a URL that has no query string, so
 * reading it any later finds nothing.
 *
 * Not stored anywhere: a reload or a second tab starts from whatever its own URL carries.
 */
let returnTo: string | null = getReturnToFromSearch(window.location.search);

export function getDashboardReturnTo(): string | null {
  return returnTo;
}

export function clearDashboardReturnTo(): void {
  returnTo = null;
}
