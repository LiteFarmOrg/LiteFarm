import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

const barnProperties = ['wash_and_pack', 'cold_storage'];
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
    deleteBarnSuccess: barnAdapter.removeOne,
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
    return barns.filter((barn) => barn.farm_id === farm_id);
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
