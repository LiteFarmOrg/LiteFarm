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

import { put, select } from 'redux-saga/effects';
import { describe, expect, test } from 'vitest';
import { getUserFarmsSaga } from '../containers/ChooseFarm/saga';
import { loginSelector, onLoadingUserFarmsStart } from '../containers/userFarmSlice';

const USER_ID = '11111111-1111-1111-1111-111111111111';

describe('getUserFarmsSaga', () => {
  test('makes no request and dispatches nothing without an identity', () => {
    const saga = getUserFarmsSaga();

    expect(saga.next().value).toEqual(select(loginSelector));

    const afterSelect = saga.next({ user_id: undefined });

    expect(afterSelect.done).toBe(true);
    expect(afterSelect.value).toBe(undefined);
  });

  test('proceeds to the request when an identity is present', () => {
    const saga = getUserFarmsSaga();

    expect(saga.next().value).toEqual(select(loginSelector));
    expect(saga.next({ user_id: USER_ID }).value).toEqual(put(onLoadingUserFarmsStart()));
  });
});
