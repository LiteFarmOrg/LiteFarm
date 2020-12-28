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
import { Router } from 'react-router-dom';
import history from './history';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import ReduxToastr from 'react-redux-toastr';
import createSagaMiddleware from 'redux-saga';
import homeSaga from './containers/saga';
import addFarmSaga from './containers/AddFarm/saga';
import peopleSaga from './containers/Profile/People/saga';
import signUpSaga from './containers/CustomSignUp/saga';
import resetUserPasswordSaga from './containers/PasswordResetAccount/saga';
import logSaga from './containers/Log/saga';
import outroSaga from './containers/Outro/saga';
import fertSaga from './containers/Log/FertilizingLog/saga';
import defaultAddLogSaga from './containers/Log/Utility/saga';
import pestControlSaga from './containers/Log/PestControlLog/saga';
import shiftSaga from './containers/Shift/saga';
import fieldSaga from './containers/Field/saga';
import financeSaga from './containers/Finances/saga';
import cropSaga from './components/Forms/NewCropModal/saga';
import insightSaga from './containers/Insights/saga';
import contactSaga from './containers/Contact/saga';
import farmDataSaga from './containers/Profile/Farm/saga';
import chooseFarmSaga from './containers/ChooseFarm/saga';
import certifierSurveySaga from './containers/OrganicCertifierSurvey/saga';
import consentSaga from './containers/Consent/saga';
import { Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducer';
import { unregister } from './registerServiceWorker';
import loginSaga from './containers/GoogleLoginButton/saga';
import newFieldSaga from './containers/Field/NewField/saga';
import editFieldSaga from './containers/Field/EditField/saga';

// config for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};
const languages = ['en', 'es', 'pt', 'fr'];

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [...getDefaultMiddleware(), ...middlewares],
  devTools: process.env.REACT_APP_ENV !== 'production',
});

// https://redux-toolkit.js.org/tutorials/advanced-tutorial#store-setup-and-hmr
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducer', () => {
    const newRootReducer = require('./reducer').default;
    store.replaceReducer(newRootReducer);
  });
}
if (!localStorage.getItem('litefarm_lang')) {
  const currentLanguage = navigator.language.split('-')[0];
  const selectedLanguage = languages.includes(currentLanguage) ? currentLanguage : 'en';
  localStorage.setItem('litefarm_lang', selectedLanguage);
}

sagaMiddleware.run(homeSaga);
// sagaMiddleware.run(createAccount);
sagaMiddleware.run(addFarmSaga);
sagaMiddleware.run(peopleSaga);
sagaMiddleware.run(signUpSaga);
sagaMiddleware.run(resetUserPasswordSaga);
sagaMiddleware.run(logSaga);
sagaMiddleware.run(outroSaga);
sagaMiddleware.run(fertSaga);
sagaMiddleware.run(defaultAddLogSaga);
sagaMiddleware.run(pestControlSaga);
sagaMiddleware.run(shiftSaga);
sagaMiddleware.run(fieldSaga);
sagaMiddleware.run(financeSaga);
sagaMiddleware.run(cropSaga);
sagaMiddleware.run(insightSaga);
sagaMiddleware.run(contactSaga);
sagaMiddleware.run(farmDataSaga);
sagaMiddleware.run(chooseFarmSaga);
sagaMiddleware.run(certifierSurveySaga);
sagaMiddleware.run(consentSaga);
sagaMiddleware.run(newFieldSaga);
sagaMiddleware.run(editFieldSaga);
sagaMiddleware.run(loginSaga);

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
        <Router history={history}>
          <div>
            <ReduxToastr
              timeOut={4000}
              newestOnTop={false}
              preventDuplicates
              position="top-left"
              transitionIn="fadeIn"
              transitionOut="fadeOut"
              progressBar
              closeOnToastrClick
            />
            <App />
          </div>
        </Router>
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
