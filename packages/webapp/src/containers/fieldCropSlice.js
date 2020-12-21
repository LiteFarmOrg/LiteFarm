import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { fieldEntitiesSelector, fieldsSelector } from './fieldSlice';

const getFieldCrop = (obj) => {
  const { field_crop_id, crop_id, field_id, start_date, end_date, area_used, estimated_production, variety, estimated_revenue, is_by_bed, bed_config, } = obj;
  return { field_crop_id, crop_id, field_id, start_date, end_date, area_used, estimated_production, variety, estimated_revenue, is_by_bed, bed_config, }
}

const addOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
}

const updateOneFieldCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertOne(state, getFieldCrop(payload));
}

const addManyFieldCrop = (state, {payload: fieldCrops}) => {
  state.loading = false;
  state.error = null;
  fieldCropAdapter.upsertMany(state, fieldCrops.map((fieldCrop) => getFieldCrop(fieldCrop)));
}

const fieldCropAdapter = createEntityAdapter({
  selectId: (fieldCrop) => fieldCrop.field_crop_id,
})

const fieldCropReducer = createSlice({
  name: 'fieldCropReducer',
  initialState: fieldCropAdapter.getInitialState({ loading: false, error: undefined }),
  reducers: {
    onLoadingFieldCropStart: onLoadingStart,
    onLoadingFieldCropFail: onLoadingFail,
    getFieldCropsSuccess: addManyFieldCrop,
    postFieldCropSuccess: addOneFieldCrop,
    putFieldCropSuccess(state, { payload: { fieldCrop, farm_id } }) {
      fieldCropAdapter.updateOne(state, { changes: { fieldCrop }, id: farm_id });
    },
    selectFieldCropSuccess(state, {payload: fieldCrop_id}){
      state.fieldCrop_id = fieldCrop_id;
    }

  },
});
export const {
  getFieldCropsSuccess, postFieldCropSuccess, putFieldCropSuccess,
  onLoadingFieldCropStart, onLoadingFieldCropFail,
} = fieldCropReducer.actions;
export default fieldCropReducer.reducer;

export const fieldCropReducerSelector = state => state.entitiesReducer[fieldCropReducer.name];

const fieldCropSelectors = fieldCropAdapter.getSelectors((state) => state.entitiesReducer[fieldCropReducer.name])

export const fieldCropsSelector = createSelector([fieldCropSelectors.selectAll, fieldEntitiesSelector, loginSelector], (fieldCrops, fieldEntities, { farm_id }) => {
  return fieldCrops.filter((fieldCrop) => fieldEntities[fieldCrop.field_id].farm_id === farm_id);
})

export const expiredFieldCropsSelector = (state) =>{
  const fieldCrops = fieldCropsSelector(state);
  return fieldCrops.filter((fieldCrop) => new Date(fieldCrop.end_date).getTime() < new Date().getTime());
}

export const currentFieldCropsSelector = (state) =>{
  const fieldCrops = fieldCropsSelector(state);
  return fieldCrops.filter((fieldCrop) => new Date(fieldCrop.end_date).getTime() >= new Date().getTime());
}

export const fieldCropSelector = fieldCropSelectors.selectById;

export const fieldCropStatusSelector = createSelector([fieldCropReducerSelector], ({ loading, error }) => {
  return { loading, error };
})
