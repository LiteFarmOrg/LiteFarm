import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { switchFarmSelector } from './ChooseFarm/chooseFarmFlowSlice';
import { showHelpRequestModalSelector } from './Home/homeSlice';
import { doesCertifierSurveyExistSelector } from './OrganicCertifierSurvey/slice';
import { isAdminSelector } from './userFarmSlice';

const initialState = {
  loaded: false,
  loading: false,
  map: false,
  draw_area: false,
  draw_line: false,
  drop_point: false,
  adjust_area: false,
  adjust_line: false,
  navigation: false,
  introduce_map: false,
  crop_catalog: false,
  documents: false,
  compliance_docs_and_certification: false,
  transplant: false,
  management_plan_creation: false,
  planting_task: false,
};

const showedSpotlightSlice = createSlice({
  name: 'showedSpotlightReducer',
  initialState,
  reducers: {
    spotlightLoading: (state, action) => {
      state.loading = true;
    },
    getSpotlightFlagsSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        state.loaded = true;
        Object.assign(state, payload);
      }
    },
    getSpotlightFlagsFailure: (state, action) => {
      state.loading = false;
      state.loaded = true;
    },
    patchSpotlightFlagsSuccess: (state, { payload }) => {
      state.loading = false;
      Object.assign(state, payload);
    },
    patchSpotlightFlagsFailure: (state, action) => {
      state.loading = false;
    },
  },
});
export const {
  spotlightLoading,
  getSpotlightFlagsSuccess,
  getSpotlightFlagsFailure,
  patchSpotlightFlagsSuccess,
  patchSpotlightFlagsFailure,
} = showedSpotlightSlice.actions;
export default showedSpotlightSlice.reducer;
export const showedSpotlightSelector = (state) => state?.entitiesReducer[showedSpotlightSlice.name];

export const activeHomeModalSelector = createSelector(
  [
    switchFarmSelector,
    doesCertifierSurveyExistSelector,
    showHelpRequestModalSelector,
    isAdminSelector,
    showedSpotlightSelector,
  ],
  (
    showSwitchFarmModal,
    doesCertifierSurveyExist,
    showHelpRequestModal,
    isAdmin,
    { introduce_map, navigation },
  ) => {
    const showCertificationsModal = !doesCertifierSurveyExist && isAdmin;
    const showNotifyUpdatedFarmModal = !introduce_map && navigation;

    if (showSwitchFarmModal) return 'switchFarm';
    if (showHelpRequestModal) return 'helpRequest';
    if (showCertificationsModal) return 'certifications';
    if (showNotifyUpdatedFarmModal) return 'notifyUpdatedFarm';
    return null;
  },
);
