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
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { Router } from 'react-router-dom';
import history from './history';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import homeSaga from './containers/saga';
import addFarmSaga from './containers/AddFarm/saga';
import peopleSaga from './containers/Profile/People/saga';
import signUpSaga from './containers/CustomSignUp/saga';
import resetUserPasswordSaga from './containers/PasswordResetAccount/saga';
import outroSaga from './containers/Outro/saga';
import locationSaga from './containers/LocationDetails/saga';
import fieldLocationSaga from './containers/LocationDetails/AreaDetails/FieldDetailForm/saga';
import documentSaga from './containers/Documents/saga';
import managementPlanSaga from './containers/Crop/saga';
import gardenSaga from './containers/LocationDetails/AreaDetails/GardenDetailForm/saga';
import gateSaga from './containers/LocationDetails/PointDetails/GateDetailForm/saga';
import waterValveSaga from './containers/LocationDetails/PointDetails/WaterValveDetailForm/saga';
import naturalAreaSaga from './containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/saga';
import barnSaga from './containers/LocationDetails/AreaDetails/BarnDetailForm/saga';
import surfaceWaterSaga from './containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/saga';
import greenhouseSaga from './containers/LocationDetails/AreaDetails/GreenhouseDetailForm/saga';
import ceremonialSaga from './containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/saga';
import residenceSaga from './containers/LocationDetails/AreaDetails/ResidenceDetailForm/saga';
import farmSiteBoundarySaga from './containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/saga';
import fenceSaga from './containers/LocationDetails/LineDetails/FenceDetailForm/saga';
import bufferZoneSaga from './containers/LocationDetails/LineDetails/BufferZoneDetailForm/saga';
import watercourseSaga from './containers/LocationDetails/LineDetails/WatercourseDetailForm/saga';
import shiftSaga from './containers/Shift/saga';
import financeSaga from './containers/Finances/saga';
import varietalSaga from './containers/AddCropVariety/saga';
import insightSaga from './containers/Insights/saga';
import farmDataSaga from './containers/Profile/Farm/saga';
import chooseFarmSaga from './containers/ChooseFarm/saga';
import supportSaga from './containers/Help/saga';
import certifierSurveySaga from './containers/OrganicCertifierSurvey/saga';
import consentSaga from './containers/Consent/saga';
import callbackSaga from './containers/Callback/saga';
import inviteUserSaga from './containers/InviteUser/saga';
import exportSaga from './containers/ExportDownload/saga';
import { Provider } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducer';
import { unregister } from './registerServiceWorker';
import loginSaga from './containers/GoogleLoginButton/saga';
import inviteSaga from './containers/InvitedUserCreateAccount/saga';
import SSOInfoSaga from './containers/SSOUserCreateAccountInfo/saga';
import weatherSaga from './containers/WeatherBoard/saga';
import mapSaga from './containers/Map/saga';
import uploadDocumentSaga from './containers/Documents/DocumentUploader/saga';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './assets/theme';
import cropVarietyImageUploaderSaga from './containers/ImagePickerWrapper/saga';
import certificationsSaga from './containers/Certifications/saga';
import taskSaga from './containers/Task/saga';
import abandonAndCompleteManagementPlanSaga from './containers/Crop/CompleteManagementPlan/saga';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.7,
  });
}
// config for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};
const languages = ['en', 'es', 'pt'];

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      thunk: true,
      immutableCheck: false,
      serializableCheck: false,
    }),
    ...middlewares,
  ],
  devTools: process.env.REACT_APP_ENV !== 'production',
});

// https://redux-toolkit.js.org/tutorials/advanced-tutorial#store-setup-and-hmr
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducer', () => {
    const newRootReducer = require('./reducer').default;
    store.replaceReducer(newRootReducer);
  });
}


sagaMiddleware.run(homeSaga);
// sagaMiddleware.run(createAccount);
sagaMiddleware.run(addFarmSaga);
sagaMiddleware.run(peopleSaga);
sagaMiddleware.run(signUpSaga);
sagaMiddleware.run(resetUserPasswordSaga);

sagaMiddleware.run(outroSaga);

sagaMiddleware.run(locationSaga);
sagaMiddleware.run(fieldLocationSaga);
sagaMiddleware.run(managementPlanSaga);
sagaMiddleware.run(gardenSaga);
sagaMiddleware.run(gateSaga);
sagaMiddleware.run(barnSaga);
sagaMiddleware.run(surfaceWaterSaga);
sagaMiddleware.run(bufferZoneSaga);
sagaMiddleware.run(naturalAreaSaga);
sagaMiddleware.run(greenhouseSaga);
sagaMiddleware.run(residenceSaga);
sagaMiddleware.run(ceremonialSaga);
sagaMiddleware.run(waterValveSaga);
sagaMiddleware.run(farmSiteBoundarySaga);
sagaMiddleware.run(fenceSaga);
sagaMiddleware.run(watercourseSaga);
sagaMiddleware.run(shiftSaga);
sagaMiddleware.run(financeSaga);
sagaMiddleware.run(varietalSaga);
sagaMiddleware.run(insightSaga);
sagaMiddleware.run(farmDataSaga);
sagaMiddleware.run(chooseFarmSaga);
sagaMiddleware.run(certifierSurveySaga);
sagaMiddleware.run(consentSaga);
sagaMiddleware.run(loginSaga);
sagaMiddleware.run(supportSaga);
sagaMiddleware.run(callbackSaga);
sagaMiddleware.run(inviteSaga);
sagaMiddleware.run(SSOInfoSaga);
sagaMiddleware.run(weatherSaga);
sagaMiddleware.run(inviteUserSaga);
sagaMiddleware.run(mapSaga);
sagaMiddleware.run(uploadDocumentSaga);
sagaMiddleware.run(documentSaga);
sagaMiddleware.run(cropVarietyImageUploaderSaga);
sagaMiddleware.run(certificationsSaga);
sagaMiddleware.run(taskSaga);
sagaMiddleware.run(abandonAndCompleteManagementPlanSaga);
sagaMiddleware.run(exportSaga);

const persistor = persistStore(store);

export const purgeState = () => {
  persistor.purge();
};

export default () => {
  return { store, persistor };
};

const render = () => {
  const App = require('./App').default;
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <>
            <CssBaseline />
            <Router history={history}>
              <>
                <App />
              </>
            </Router>
          </>
        </ThemeProvider>
      </PersistGate>
    </Provider>,
    document.getElementById('root'),
  );
};

render();

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', render);
}

//FIXME: service worker disabled for now. Causing problems when deploying: shows blank page until N+1th visit
// https://twitter.com/dan_abramov/status/954146978564395008
unregister();
