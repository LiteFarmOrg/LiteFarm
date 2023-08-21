/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { Router } from 'react-router-dom';
// @ts-expect-error until migrated to TypeScript
import history from './history';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  CssBaseline,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material';
import theme from './assets/theme';
// @ts-expect-error until migrated to TypeScript
import App from './App';
// @ts-expect-error until migrated to TypeScript
import { sagaMiddleware } from './store/sagaMiddleware';
// @ts-expect-error until migrated to TypeScript
import { persistor, store } from './store/store';
// @ts-expect-error until migrated to TypeScript
import { GlobalScss } from './components/GlobalScss';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { sagas } from './store/sagas';
import { Store } from 'redux';

const clientId = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.7,
  });
}

sagas.forEach(sagaMiddleware.run);

ReactDOM.createRoot(document.getElementById('root') as Element).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <>
            <GlobalScss />
            <CssBaseline />
            <GoogleOAuthProvider clientId={clientId}>
              <Router history={history}>
                <>
                  <App />
                </>
              </Router>
            </GoogleOAuthProvider>
          </>
        </ThemeProvider>
      </StyledEngineProvider>
    </PersistGate>
  </Provider>
);

type LitefarmWindow = typeof window & { Cypress?: unknown; store: Store };

if ((window as LitefarmWindow).Cypress) {
  (window as LitefarmWindow).store = store;
}
