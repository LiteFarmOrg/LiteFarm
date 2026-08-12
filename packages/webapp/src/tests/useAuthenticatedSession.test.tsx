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

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
// store/reducer pulls in slices that import store/store, and store/store imports store/reducer.
// Evaluating store/store first keeps that cycle from handing configureStore an undefined reducer.
import '../store/store';
import rootReducer from '../store/reducer';
import { loginSuccess } from '../containers/userFarmSlice';
import useAuthenticatedSession from '../hooks/useAuthenticatedSession';

const USER_ID = '11111111-1111-1111-1111-111111111111';

const buildStore = ({ userId }: { userId?: string }) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
  });

  if (userId) {
    store.dispatch(loginSuccess({ user_id: userId }));
  }

  return store;
};

const renderSession = ({ token, userId }: { token?: string; userId?: string }) => {
  if (token) {
    localStorage.setItem('id_token', token);
  }

  const store = buildStore({ userId });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useAuthenticatedSession(), { wrapper });
};

describe('useAuthenticatedSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(cleanup);

  test('a token with an identity is a usable session', () => {
    const { result } = renderSession({ token: 'a-token', userId: USER_ID });

    expect(result.current).toBe(true);
    expect(localStorage.getItem('id_token')).toBe('a-token');
  });

  // `localStorage` is shared between tabs, so removing the token here would reach a tab that is
  // signed in and using it.
  test('a token with no identity is not a usable session, and the token is left in place', () => {
    const { result } = renderSession({ token: 'a-token' });

    expect(result.current).toBe(false);
    expect(localStorage.getItem('id_token')).toBe('a-token');
  });

  test('an identity with no token is not a usable session', () => {
    const { result } = renderSession({ userId: USER_ID });

    expect(result.current).toBe(false);
  });

  test('a signed-out browser is left alone', () => {
    const { result } = renderSession({});

    expect(result.current).toBe(false);
    expect(localStorage.getItem('id_token')).toBe(null);
  });
});
