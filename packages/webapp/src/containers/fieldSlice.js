import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';

const addOneField = (state, { payload }) => {
  const { field_name, grid_points, field_id, farm_id, area, station_id } = payload;
  state.loading = false;
  state.error = null;
  state.loaded = true;
  fieldAdapter.upsertOne(state, { field_name, grid_points, field_id, farm_id, area, station_id });
};

const updateOneField = (state, { payload }) => {
  const { field_name, grid_points, field_id, farm_id, area, station_id } = payload;
  state.loading = false;
  state.error = null;
  fieldAdapter.updateOne(state, { field_name, grid_points, field_id, farm_id, area, station_id });
};

const addManyField = (state, { payload: fields }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  fieldAdapter.upsertMany(state, fields);
};

const fieldAdapter = createEntityAdapter({
  selectId: (field) => field.field_id,
});

const fieldReducer = createSlice({
  name: 'fieldReducer',
  initialState: fieldAdapter.getInitialState({
    loading: false,
    error: undefined,
    field_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldStart: onLoadingStart,
    onLoadingFieldFail: onLoadingFail,
    getFieldsSuccess: addManyField,
    postFieldSuccess: addOneField,
    putFieldSuccess(state, { payload: field }) {
      fieldAdapter.updateOne(state, { changes: field, id: field.field_id });
    },
    selectFieldSuccess(state, { payload: field_id }) {
      state.field_id = field_id;
    },
    deleteFieldSuccess: fieldAdapter.removeOne,
  },
});
export const {
  getFieldsSuccess,
  postFieldSuccess,
  putFieldSuccess,
  onLoadingFieldStart,
  onLoadingFieldFail,
  deleteFieldSuccess,
} = fieldReducer.actions;
export default fieldReducer.reducer;

export const fieldReducerSelector = (state) => state.entitiesReducer[fieldReducer.name];

const fieldSelectors = fieldAdapter.getSelectors(
  (state) => state.entitiesReducer[fieldReducer.name],
);

export const fieldEntitiesSelector = fieldSelectors.selectEntities;
export const fieldsSelector = createSelector(
  [fieldSelectors.selectAll, loginSelector],
  (fields, { farm_id }) => {
    return fields.filter((field) => field.farm_id === farm_id);
  },
);

export const fieldSelector = createSelector(
  fieldReducerSelector,
  ({ field_id, entities }) => entities[field_id],
);

export const fieldStatusSelector = createSelector(
  [fieldReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
