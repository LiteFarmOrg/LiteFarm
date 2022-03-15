import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from '../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../util/pick';

export const certifierSurveyProperties = [
  'certification_id',
  'certifier_id',
  'farm_id',
  'interested',
  'requested_certification',
  'requested_certifier',
  'survey_id',
];

const upsertOneOrganicCertifierSurvey = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  certifierSurveyAdapter.upsertOne(state, pick(payload, certifierSurveyProperties));
};

const certifierSurveyAdapter = createEntityAdapter({
  selectId: (certifierSurvey) => certifierSurvey.farm_id,
});

const slice = createSlice({
  name: 'certifierSurveyReducer',
  initialState: certifierSurveyAdapter.getInitialState({
    loading: false,
    error: undefined,
  }),
  reducers: {
    onLoadingCertifierSurveyStart: onLoadingStart,
    onLoadingCertifierSurveyFail: onLoadingFail,
    getCertificationSurveysSuccess: upsertOneOrganicCertifierSurvey,
    postOrganicCertifierSurveySuccess: upsertOneOrganicCertifierSurvey,
    putOrganicCertifierSurveySuccess: upsertOneOrganicCertifierSurvey,
    patchRequestedCertifiersSuccess(state, { payload: { requested_certifier, farm_id } }) {
      certifierSurveyAdapter.updateOne(state, {
        changes: { requested_certifier },
        id: farm_id,
      });
    },
    patchInterestedSuccess(state, { payload: { interested, farm_id } }) {
      certifierSurveyAdapter.updateOne(state, {
        changes: { interested },
        id: farm_id,
      });
    },
    patchRequestedCertificationSuccess(state, { payload: { requested_certification, farm_id } }) {
      certifierSurveyAdapter.updateOne(state, {
        changes: { requested_certification },
        id: farm_id,
      });
    },
  },
});
export const {
  getCertificationSurveysSuccess,
  postOrganicCertifierSurveySuccess,
  putOrganicCertifierSurveySuccess,
  patchRequestedCertifiersSuccess,
  patchRequestedCertificationSuccess,
  patchInterestedSuccess,
  onLoadingCertifierSurveyStart,
  onLoadingCertifierSurveyFail,
} = slice.actions;
export default slice.reducer;

export const certifierSurveyReducerSelector = (state) => state.entitiesReducer[slice.name];

const certifierSurveySelectors = certifierSurveyAdapter.getSelectors(
  (state) => state.entitiesReducer[slice.name],
);

export const certifierSurveySelector = (state) => {
  const { farm_id } = loginSelector(state);
  return farm_id ? certifierSurveySelectors.selectById(state, farm_id) || {} : {};
};

export const certifierSurveyStatusSelector = createSelector(
  [certifierSurveyReducerSelector],
  ({ loading, error }) => {
    return { loading, error };
  },
);
