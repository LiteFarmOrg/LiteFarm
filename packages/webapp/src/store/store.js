import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { api } from './api/apiSlice';
import rootReducer from './reducer';
import { sagaMiddleware } from './sagaMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      thunk: true,
      immutableCheck: false,
      serializableCheck: false,
    })
      .concat(api.middleware)
      .concat(sagaMiddleware),
  ],
  devTools: import.meta.env.VITE_ENV !== 'production',
});

export const purgeState = () => {
  persistor.purge();
};
export const persistor = persistStore(store);
