import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { pick } from '../util/pick';

const barnProperties = ['wash_and_pack', 'cold_storage', 'used_for_animals', 'location_id'];
export const getLocationObjectFromBarn = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    barn: pick(data, barnProperties),
    ...pick(data, locationProperties),
  };
};
const getBarnFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.barn, barnProperties),
  };
};

const upsertOneBarnWithLocation = (state, { payload: location }) => {
  barnAdapter.upsertOne(state, getBarnFromLocationObject(location));
};
const upsertManyBarnWithLocation = (state, { payload: locations }) => {
  barnAdapter.upsertMany(
    state,
    locations.map((location) => getBarnFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteBarn = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  barnAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const barnAdapter = createEntityAdapter({
  selectId: (barn) => barn.location_id,
});

const barnSlice = createSlice({
  name: 'barnReducer',
  initialState: barnAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBarnStart: onLoadingStart,
    onLoadingBarnFail: onLoadingFail,
    getBarnsSuccess: upsertManyBarnWithLocation,
    postBarnSuccess: upsertOneBarnWithLocation,
    editBarnSuccess: upsertOneBarnWithLocation,
    deleteBarnSuccess: softDeleteBarn,
  },
});
export const {
  getBarnsSuccess,
  postBarnSuccess,
  editBarnSuccess,
  onLoadingBarnStart,
  onLoadingBarnFail,
  deleteBarnSuccess,
} = barnSlice.actions;
export default barnSlice.reducer;

export const barnReducerSelector = (state) => state.entitiesReducer[barnSlice.name];

const barnSelectors = barnAdapter.getSelectors((state) => state.entitiesReducer[barnSlice.name]);

export const barnEntitiesSelector = barnSelectors.selectEntities;
export const barnsSelector = createSelector(
  [barnSelectors.selectAll, loginSelector],
  (barns, { farm_id }) => {
    return barns.filter((barn) => barn.farm_id === farm_id && !barn.deleted);
  },
);

export const barnSelector = (location_id) =>
  createSelector(barnEntitiesSelector, (entities) => entities[location_id]);

export const barnStatusSelector = createSelector(
  [barnReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
