import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';

const getFieldCrop = (obj) => {
  return pick(obj, [
    'field_crop_id',
    'crop_id',
    'location_id',
    'start_date',
    'end_date',
    'area_used',
    'estimated_production',
    'variety',
    'estimated_revenue',
    'is_by_bed',
    'bed_config',
  ]);
};

const addOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
};

const updateOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
};

const addManyFieldCrop = (state, { payload: fieldCrops }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  fieldCropAdapter.upsertMany(
    state,
    fieldCrops.map((fieldCrop) => getFieldCrop(fieldCrop)),
  );
};

const fieldCropAdapter = createEntityAdapter({
  selectId: (fieldCrop) => fieldCrop.field_crop_id,
});

const fieldCropSlice = createSlice({
  name: 'fieldCropReducer',
  initialState: fieldCropAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldCropStart: onLoadingStart,
    onLoadingFieldCropFail: onLoadingFail,
    getFieldCropsSuccess: addManyFieldCrop,
    postFieldCropSuccess: addOneFieldCrop,
    putFieldCropSuccess(state, { payload: fieldCrop }) {
      fieldCropAdapter.updateOne(state, { changes: fieldCrop, id: fieldCrop.field_crop_id });
    },
    deleteFieldCropSuccess: fieldCropAdapter.removeOne,
    selectFieldCropSuccess(state, { payload: fieldCrop_id }) {
      state.fieldCrop_id = fieldCrop_id;
    },
  },
});
export const {
  getFieldCropsSuccess,
  postFieldCropSuccess,
  putFieldCropSuccess,
  onLoadingFieldCropStart,
  onLoadingFieldCropFail,
  deleteFieldCropSuccess,
} = fieldCropSlice.actions;
export default fieldCropSlice.reducer;

export const fieldCropReducerSelector = (state) => state.entitiesReducer[fieldCropSlice.name];

const fieldCropSelectors = fieldCropAdapter.getSelectors(
  (state) => state.entitiesReducer[fieldCropSlice.name],
);

export const fieldCropsSelector = createSelector(
  [fieldCropSelectors.selectAll, cropLocationEntitiesSelector, cropEntitiesSelector, loginSelector],
  (fieldCrops, cropLocationEntities, cropEntities, { farm_id }) => {
    const fieldCropsOfCurrentFarm = fieldCrops.filter(
      (fieldCrop) => cropLocationEntities[fieldCrop.location_id]?.farm_id === farm_id,
    );
    return fieldCropsOfCurrentFarm.map((fieldCrop) => ({
      ...cropEntities[fieldCrop.crop_id],
      ...cropLocationEntities[fieldCrop.location_id],
      ...fieldCrop,
    }));
  },
);

export const expiredFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return fieldCrops.filter(
      (fieldCrop) => new Date(fieldCrop.end_date).getTime() < lastActiveDatetime,
    );
  },
);

export const currentFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return fieldCrops.filter(
      (fieldCrop) =>
        new Date(fieldCrop.end_date).getTime() >= lastActiveDatetime &&
        new Date(fieldCrop.start_date).getTime() <= lastActiveDatetime,
    );
  },
);

export const plannedFieldCropsSelector = createSelector(
  [fieldCropsSelector, lastActiveDatetimeSelector],
  (fieldCrops, lastActiveDatetime) => {
    return fieldCrops.filter(
      (fieldCrop) =>
        new Date(fieldCrop.end_date).getTime() >= lastActiveDatetime &&
        new Date(fieldCrop.start_date).getTime() >= lastActiveDatetime,
    );
  },
);

export const fieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, fieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const expiredFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, expiredFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const currentFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, currentFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const plannedFieldCropsByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, plannedFieldCropsSelector], (location_id, fieldCrops) =>
    fieldCrops.filter((fieldCrop) => fieldCrop.location_id === location_id),
  );

export const fieldCropSelector = fieldCropSelectors.selectById;

export const fieldCropStatusSelector = createSelector(
  [fieldCropReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
