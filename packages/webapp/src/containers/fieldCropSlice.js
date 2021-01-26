import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { fieldEntitiesSelector, fieldsSelector } from './fieldSlice';
import { cropEntitiesSelector } from './cropSlice';

const getFieldCrop = (obj) => {
  const {
    field_crop_id,
    crop_id,
    field_id,
    start_date,
    end_date,
    area_used,
    estimated_production,
    variety,
    estimated_revenue,
    is_by_bed,
    bed_config,
  } = obj;
  return {
    field_crop_id,
    crop_id,
    field_id,
    start_date,
    end_date,
    area_used,
    estimated_production,
    variety,
    estimated_revenue,
    is_by_bed,
    bed_config,
  };
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
  [fieldCropSelectors.selectAll, fieldEntitiesSelector, cropEntitiesSelector, loginSelector],
  (fieldCrops, fieldEntities, cropEntities, { farm_id }) => {
    const fieldCropsOfCurrentFarm = fieldCrops.filter(
      (fieldCrop) => fieldEntities[fieldCrop.field_id]?.farm_id === farm_id,
    );
    return fieldCropsOfCurrentFarm.map((fieldCrop) => ({
      ...cropEntities[fieldCrop.crop_id],
      ...fieldEntities[fieldCrop.field_id],
      ...fieldCrop,
    }));
  },
);

export const expiredFieldCropsSelector = (state) => {
  const fieldCrops = fieldCropsSelector(state);
  return fieldCrops.filter(
    (fieldCrop) => new Date(fieldCrop.end_date).getTime() < new Date().getTime(),
  );
};

export const currentFieldCropsSelector = (state) => {
  const fieldCrops = fieldCropsSelector(state);
  return fieldCrops.filter(
    (fieldCrop) => new Date(fieldCrop.end_date).getTime() >= new Date().getTime(),
  );
};

export const fieldCropSelector = fieldCropSelectors.selectById;

export const fieldCropStatusSelector = createSelector(
  [fieldCropReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
