import { persistReducer, persistStore } from 'redux-persist';
import { AnyAction, configureStore } from '@reduxjs/toolkit';
import { sagaMiddleware } from './sagaMiddleware';
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
  devTools: import.meta.env.VITE_ENV !== 'production',
});

export const purgeState = () => {
  persistor.purge();
};

export const persistor = persistStore(store);

// https://redux-toolkit.js.org/tutorials/typescript#define-root-state-and-dispatch-types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
