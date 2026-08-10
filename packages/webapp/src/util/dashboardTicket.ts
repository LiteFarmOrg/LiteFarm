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

export const DASHBOARD_RETURN_TO_PARAM = 'return_to';

/** Not validated here — the API refuses a ticket for an address off its allowlist */
export function getReturnToFromSearch(search: string): string | null {
  return new URLSearchParams(search).get(DASHBOARD_RETURN_TO_PARAM) || null;
}

export function buildDashboardTicketUrl(returnTo: string, ticket: string): string {
  const url = new URL(returnTo);
  url.searchParams.set('ticket', ticket);
  return url.toString();
}
