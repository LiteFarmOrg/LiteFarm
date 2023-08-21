import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  onLoadingFail,
  onLoadingStart,
  onLoadingSuccess,
  userFarmSelector,
} from '../userFarmSlice';
import { createSelector } from 'reselect';
import { certifierSurveySelector } from './slice';
import { pick } from '../../util/pick';

const certifierProperties = [
  'certification_id',
  'certifier_acronym',
  'certifier_id',
  'certifier_name',
  'country_id',
  'certifier_country_id',
  'survey_id',
];

const getCertifier = (certifier) => {
  return pick(certifier, certifierProperties);
};

const certifierAdapter = createEntityAdapter({
  selectId: (certifier) => certifier.certifier_country_id,
});

const certifierSlice = createSlice({
  name: 'certifierReducer',
  initialState: certifierAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingCertifierStart: onLoadingStart,
    onLoadingCertifierFail: onLoadingFail,
    getCertifiersSuccess: (state, { payload: certifiers }) => {
      certifierAdapter.upsertMany(
        state,
        certifiers.map((certifier) => getCertifier(certifier)),
      );
      onLoadingSuccess(state);
    },
  },
});
export const { getCertifiersSuccess } = certifierSlice.actions;
export default certifierSlice.reducer;

export const certifierReducerSelector = (state) => state.entitiesReducer[certifierSlice.name];

const certifierSelectors = certifierAdapter.getSelectors(
  (state) => state.entitiesReducer[certifierSlice.name],
);

export const certifierEntitiesSelector = certifierSelectors.selectEntities;
export const certifiersSelector = createSelector(
  [certifierSelectors.selectAll, userFarmSelector],
  (certifiers, { country_id }) => {
    return certifiers.filter((certifier) => certifier.country_id === country_id);
  },
);

export const certifiersByCertificationSelector = (certification_id) =>
  createSelector(certifiersSelector, (certifiers) =>
    certifiers.filter((certifier) => {
      return certifier.certification_id === certification_id;
    }),
  );
export const certifierByCertifierIdSelector = (certifier_id) =>
  createSelector(certifiersSelector, (certifiers) =>
    certifiers.find((certifier) => {
      return certifier.certifier_id === certifier_id;
    }),
  );

export const certifierByCertifierCountryIdSelector = (certifier_country_id) =>
  createSelector(certifierEntitiesSelector, (entities) => entities[certifier_country_id]);

export const certifierSelector = createSelector(
  [certifierEntitiesSelector, certifierSurveySelector],
  (entities, { certifier_id }) => entities[certifier_id] || {},
);

export const certifierStatusSelector = createSelector(
  [certifierReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
