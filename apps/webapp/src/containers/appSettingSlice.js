import { createSlice } from '@reduxjs/toolkit';
import { APP_VERSION } from '../util/constants';

const initialState = {
  app_version: undefined,
};

const appSettingSlice = createSlice({
  name: 'appSettingReducer',
  initialState,
  reducers: {

    setAppVersion: (state, { payload: appSettings }) => {
      state.app_version = APP_VERSION;
    },

  },
});
export const {
  setAppVersion,
} = appSettingSlice.actions;
export default appSettingSlice.reducer;

export const appSettingReducerSelector = (state) => state.persistedStateReducer[appSettingSlice.name];

export const appVersionSelector = (state) => state.persistedStateReducer[appSettingSlice.name]?.app_version;
