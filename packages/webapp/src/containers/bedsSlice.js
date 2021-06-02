import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietyEntitiesSelector } from './cropVarietySlice';

const getBed = (obj) => {
  return pick(obj, [
    'estimated_revenue',
    'estimated_yield',
    'estimated_yield_unit',
    'location_id',
    'management_plan_id',
    'notes',
    'planting_type',
  ]);
};

const addOneBed = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedAdapter.upsertOne(state, getBed(payload));
};

const updateOneBed = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedAdapter.upsertOne(state, getBed(payload));
};

const addManyBed = (state, { payload: beds }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  bedAdapter.upsertMany(
    state,
    beds.map((bed) => getBed(bed)),
  );
};

const bedAdapter = createEntityAdapter({
  selectId: (bed) => bed.management_plan_id,
});

const bedSlice = createSlice({
  name: 'bedsReducer',
  initialState: bedAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBedStart: onLoadingStart,
    onLoadingBedFail: onLoadingFail,
    getBedsSuccess: addManyBed,
    postBedSuccess: addOneBed,
    putBedSuccess(state, { payload: bed }) {
      bedAdapter.updateOne(state, {
        changes: bed,
        id: bed.management_plan_id,
      });
    },
    deleteBedSuccess: bedAdapter.removeOne,
  },
});
export const {
  getBedsSuccess,
  postBedSuccess,
  putBedSuccess,
  onLoadingBedStart,
  onLoadingBedFail,
  deleteBedSuccess,
} = bedSlice.actions;
export default bedSlice.reducer;

export const bedReducerSelector = (state) => state.entitiesReducer[bedSlice.name];

const bedSelectors = bedAdapter.getSelectors((state) => state.entitiesReducer[bedSlice.name]);

export const bedsSelector = createSelector(
  [
    bedSelectors.selectAll,
    cropLocationEntitiesSelector,
    cropEntitiesSelector,
    cropVarietyEntitiesSelector,
    loginSelector,
  ],
  (beds, cropLocationEntities, cropEntities, cropVarietyEntities, { farm_id }) => {
    const bedsOfCurrentFarm = beds.filter(
      (bed) => cropLocationEntities[bed.location_id]?.farm_id === farm_id,
    );
    return bedsOfCurrentFarm.map((bed) => {
      const crop_variety = cropVarietyEntities[bed.crop_variety_id];
      const crop = cropEntities[crop_variety.crop_id];
      return {
        ...crop,
        ...crop_variety,
        location: cropLocationEntities[bed.location_id],
        ...bed,
        crop,
        crop_variety,
      };
    });
  },
);
