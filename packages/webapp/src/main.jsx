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
import history from './history';
import homeSaga from './containers/saga';
import addFarmSaga from './containers/AddFarm/saga';
import peopleSaga from './containers/Profile/People/saga';
import signUpSaga from './containers/CustomSignUp/saga';
import resetUserPasswordSaga from './containers/PasswordResetAccount/saga';
import outroSaga from './containers/Outro/saga';
import locationSaga from './containers/LocationDetails/saga';
import fieldLocationSaga from './containers/LocationDetails/AreaDetails/FieldDetailForm/saga';
import sensorDetailSaga from './containers/LocationDetails/PointDetails/SensorDetail/saga';
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
import financeSaga from './containers/Finances/saga';
import varietalSaga from './containers/AddCropVariety/saga';
import insightSaga from './containers/Insights/saga';
import chooseFarmSaga from './containers/ChooseFarm/saga';
import releaseBadgeSaga from './containers/ReleaseBadgeHandler/saga';
import supportSaga from './containers/Help/saga';
import certifierSurveySaga from './containers/OrganicCertifierSurvey/saga';
import consentSaga from './containers/Consent/saga';
import callbackSaga from './containers/Callback/saga';
import inviteUserSaga from './containers/InviteUser/saga';
import exportSaga from './containers/ExportDownload/saga';
import fieldWorkTaskSaga from './containers/Task/FieldWorkTask/saga';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import loginSaga from './containers/GoogleLoginButton/saga';
import inviteSaga from './containers/InvitedUserCreateAccount/saga';
import SSOInfoSaga from './containers/SSOUserCreateAccountInfo/saga';
import weatherSaga from './containers/WeatherBoard/saga';
import alertSaga from './containers/Navigation/Alert/saga';
import mapSaga from './containers/Map/saga';
import sensorReadingsSaga from './containers/SensorReadings/saga';
import uploadDocumentSaga from './containers/Documents/DocumentUploader/saga';
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import theme from './assets/theme';
import imageUploaderSaga from './containers/ImagePickerWrapper/saga';
import certificationsSaga from './containers/Certifications/saga';
import taskSaga from './containers/Task/saga';
import abandonAndCompleteManagementPlanSaga from './containers/Crop/CompleteManagementPlan/saga';
import notificationSaga from './containers/Notification/saga';
import errorHandlerSaga from './containers/ErrorHandler/saga';
import App from './App';
import { sagaMiddleware } from './store/sagaMiddleware';
import { persistor, store } from './store/store';
import { GlobalScss } from './components/GlobalScss';
import irrigationTaskTypesSaga from './containers/Task/IrrigationTaskTypes/saga';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    release: '3.6.0',
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.7,
  });
}

sagaMiddleware.run(homeSaga);
sagaMiddleware.run(addFarmSaga);
sagaMiddleware.run(peopleSaga);
sagaMiddleware.run(signUpSaga);
sagaMiddleware.run(resetUserPasswordSaga);
sagaMiddleware.run(outroSaga);
sagaMiddleware.run(locationSaga);
sagaMiddleware.run(fieldLocationSaga);
sagaMiddleware.run(sensorDetailSaga);
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
sagaMiddleware.run(financeSaga);
sagaMiddleware.run(varietalSaga);
sagaMiddleware.run(insightSaga);
sagaMiddleware.run(chooseFarmSaga);
sagaMiddleware.run(releaseBadgeSaga);
sagaMiddleware.run(certifierSurveySaga);
sagaMiddleware.run(consentSaga);
sagaMiddleware.run(loginSaga);
sagaMiddleware.run(supportSaga);
sagaMiddleware.run(callbackSaga);
sagaMiddleware.run(inviteSaga);
sagaMiddleware.run(SSOInfoSaga);
sagaMiddleware.run(weatherSaga);
sagaMiddleware.run(alertSaga);
sagaMiddleware.run(notificationSaga);
sagaMiddleware.run(inviteUserSaga);
sagaMiddleware.run(mapSaga);
sagaMiddleware.run(sensorReadingsSaga);
sagaMiddleware.run(uploadDocumentSaga);
sagaMiddleware.run(documentSaga);
sagaMiddleware.run(imageUploaderSaga);
sagaMiddleware.run(certificationsSaga);
sagaMiddleware.run(taskSaga);
sagaMiddleware.run(abandonAndCompleteManagementPlanSaga);
sagaMiddleware.run(exportSaga);
sagaMiddleware.run(errorHandlerSaga);
sagaMiddleware.run(fieldWorkTaskSaga);
sagaMiddleware.run(irrigationTaskTypesSaga);

ReactDOM.createRoot(document.getElementById('root')).render(
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
  </Provider>,
);

if (window.Cypress) {
  window.store = store;
}
