import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../userFarmSlice';
import { createSelector } from 'reselect';
import { certifierSurveySelector } from './slice';
import { pick } from '../../util/pick';

const certificationProperties = [
  'certification_id',
  'certification_translation_key',
  'certification_type',
];

const getCertification = (certification) => {
  return pick(certification, certificationProperties);
};

const certificationAdapter = createEntityAdapter({
  selectId: (certification) => certification.certification_id,
});

const slice = createSlice({
  name: 'certificationReducer',
  initialState: certificationAdapter.getInitialState({
    loading: false,
    error: undefined,
  }),
  reducers: {
    onLoadingCertificationStart: onLoadingStart,
    onLoadingCertificationFail: onLoadingFail,
    getCertificationsSuccess: (state, { payload: certifiers }) => {
      certificationAdapter.upsertMany(
        state,
        certifiers.map((certifier) => getCertification(certifier)),
      );
      onLoadingSuccess(state);
    },
  },
});
export const {
  onLoadingCertificationStart,
  onLoadingCertificationFail,
  getCertificationsSuccess,
} = slice.actions;
export default slice.reducer;

export const certificationReducerSelector = (state) => state.entitiesReducer[slice.name];

const certificationSelectors = certificationAdapter.getSelectors(
  (state) => state.entitiesReducer[slice.name],
);
export const certificationEntitiesSelector = certificationSelectors.selectEntities;
export const certificationByCertificationIdSelector = (certification_id) =>
  createSelector(
    [certificationEntitiesSelector],
    (certificationEntities) => certificationEntities[certification_id],
  );
export const certificationsSelector = certificationSelectors.selectAll;

export const certificationSelector = createSelector(
  [certificationEntitiesSelector, certifierSurveySelector],
  (entities, { certification_id }) => entities[certification_id],
);

export const certificationStatusSelector = createSelector(
  [certificationReducerSelector],
  ({ loading, error }) => {
    return { loading, error };
  },
);
