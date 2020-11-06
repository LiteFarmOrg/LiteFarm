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
import { Router } from "react-router-dom";
import history from './history';
import { createStore, applyMiddleware, compose } from 'redux'
import ReduxToastr from 'react-redux-toastr';
import createSagaMiddleware from 'redux-saga'
import homeSaga from './containers/saga';
import addFarmSaga from './containers/AddFarm/saga';
import notificationSaga from './containers/Profile/Notification/saga';
import peopleSaga from './containers/Profile/People/saga'
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
import userFarmSaga from'./containers/ChooseFarm/saga';
import certifierSurveySaga from './containers/OrganicCertifierSurvey/saga';
import { Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducer';
import App from './App';
import { unregister } from './registerServiceWorker';
import thunk from 'redux-thunk';


// config for redux-persist
const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware, thunk];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(...middlewares)));
sagaMiddleware.run(homeSaga);
sagaMiddleware.run(addFarmSaga);
sagaMiddleware.run(notificationSaga);
sagaMiddleware.run(peopleSaga);
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
sagaMiddleware.run(userFarmSaga);
sagaMiddleware.run(certifierSurveySaga);

const persistor = persistStore(store);

export const purgeState  = () => {
  persistor.purge();
}

export default () => {
  return { store, persistor }
}
// encapsulate whole app component within router and react-redux
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
    document.getElementById('root'));
//FIXME: service worker disabled for now. Causing problems when deploying: shows blank page until N+1th visit
// https://twitter.com/dan_abramov/status/954146978564395008
unregister();
