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

/**
 * The query parameter the Analytics Dashboard uses to tell LiteFarm where to send the
 * browser once the user is signed in and a ticket has been issued.
 */
export const DASHBOARD_RETURN_TO_PARAM = 'return_to';

/**
 * Reads the return address out of a location search string. The value is not validated
 * here: the API checks it against its allowlist and refuses to issue a ticket for an
 * address that is not on it.
 */
export function getReturnToFromSearch(search: string): string | null {
  return new URLSearchParams(search).get(DASHBOARD_RETURN_TO_PARAM) || null;
}

/**
 * Attaches the ticket to the return address, preserving any query string the address
 * already carries.
 */
export function buildDashboardTicketUrl(returnTo: string, ticket: string): string {
  const url = new URL(returnTo);
  url.searchParams.set('ticket', ticket);
  return url.toString();
}
