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

import { useSelector } from 'react-redux';
import { userFarmReducerSelector } from '../containers/userFarmSlice';
import type { RootState } from '../store/store';
import { isAuthenticated } from '../util/jwt';

/**
 * Reports whether the browser holds a session the app can render.
 *
 * A session needs two values that are written to browser storage separately: `id_token` in
 * `localStorage`, and `user_id` in the persisted Redux store. They can disagree. `localStorage` is
 * shared between tabs and each tab writes the whole of `persist:root` on any state change, so a
 * tab holding no identity overwrites a signed-in tab's `user_id` and leaves the token behind.
 *
 * A token on its own admits nothing: every farm selector filters on `user_id` and returns empty,
 * so the app has no farm to render.
 */
export default function useAuthenticatedSession(): boolean {
  const hasIdentity = useSelector((state: RootState) => !!userFarmReducerSelector(state).user_id);

  return hasIdentity && isAuthenticated();
}
