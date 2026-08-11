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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loginSelector } from '../containers/userFarmSlice';
import { isAuthenticated, logout } from '../util/jwt';

/**
 * Reports whether the browser holds a session the app can render, and clears one it cannot.
 *
 * A session needs two values that are written to browser storage separately: `id_token` in
 * `localStorage`, and `user_id` in the persisted Redux store. They can disagree. `localStorage` is
 * shared between tabs and each tab writes the whole of `persist:root` on any state change, so a
 * tab holding no identity overwrites a signed-in tab's `user_id` and leaves the token behind.
 *
 * A token with no identity is not recoverable in the app: every farm selector filters on `user_id`
 * and returns empty, onboarding reads that as "no farms" and sends the user to the
 * create-your-first-farm screen, and no request returns 401, so nothing signs the user out.
 *
 * This is the single place the app decides whether a stored session is usable.
 */
export default function useAuthenticatedSession(): boolean {
  const { user_id } = useSelector(loginSelector);
  const hasIdentity = !!user_id;

  useEffect(() => {
    if (isAuthenticated() && !hasIdentity) {
      logout();
    }
  }, []);

  return isAuthenticated() && hasIdentity;
}
