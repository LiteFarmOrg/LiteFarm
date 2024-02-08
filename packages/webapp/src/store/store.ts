import { persistReducer, persistStore } from 'redux-persist';
import { AnyAction, Middleware, configureStore } from '@reduxjs/toolkit';
import { sagaMiddleware } from './sagaMiddleware';
import { api } from './api/apiSlice';
import rootReducer from './reducer';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';

export type RootReducer = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
};

// https://github.com/rt2zz/redux-persist/issues/1140#issuecomment-1208523633
const persistedReducer = persistReducer<RootReducer, AnyAction>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware): Middleware[] => [
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

// https://redux-toolkit.js.org/tutorials/typescript#define-root-state-and-dispatch-types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
