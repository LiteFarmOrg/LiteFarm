import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

export const barnEnum = {
  farm_id: 'farm_id',
  name: 'name',
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
  wash_and_pack: 'wash_and_pack',
  cold_storage: 'cold_storage',
};
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
    farm_id: location.farm_id,
    name: location.name,
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
    deleteBarnSuccess: barnAdapter.removeOne,
  },
});
export const {
  getBarnsSuccess,
  postBarnSuccess,
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

export const barnSelector = createSelector(
  barnReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const barnStatusSelector = createSelector(
  [barnReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
