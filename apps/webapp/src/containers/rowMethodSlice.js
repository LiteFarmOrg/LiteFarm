import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';

export const rowProperties = [
  'number_of_rows',
  'plant_spacing',
  'plant_spacing_unit',
  'planting_depth',
  'planting_depth_unit',
  'planting_management_plan_id',
  'row_length',
  'row_length_unit',
  'row_spacing',
  'row_spacing_unit',
  'row_width',
  'row_width_unit',
  'same_length',
  'specify_rows',
  'total_rows_length',
  'total_rows_length_unit',
];
const getRowMethod = (obj) => {
  return pick(obj, rowProperties);
};

const addOneRowMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  rowMethodAdapter.upsertOne(state, getRowMethod(payload));
};

const updateOneRowMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  rowMethodAdapter.upsertOne(state, getRowMethod(payload));
};

const addManyRowMethod = (state, { payload: rowMethods }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  rowMethodAdapter.upsertMany(
    state,
    rowMethods.map((rowMethod) => getRowMethod(rowMethod)),
  );
};

const rowMethodAdapter = createEntityAdapter({
  selectId: (rowMethod) => rowMethod.planting_management_plan_id,
});

const rowMethodSlice = createSlice({
  name: 'rowMethodReducer',
  initialState: rowMethodAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingRowMethodStart: onLoadingStart,
    onLoadingRowMethodFail: onLoadingFail,
    getRowMethodsSuccess: addManyRowMethod,
    postRowMethodSuccess: addOneRowMethod,
    putRowMethodSuccess(state, { payload: rowMethod }) {
      rowMethodAdapter.updateOne(state, {
        changes: rowMethod,
        id: rowMethod.management_plan_id,
      });
    },
    deleteRowMethodSuccess: rowMethodAdapter.removeOne,
  },
});
export const {
  getRowMethodsSuccess,
  postRowMethodSuccess,
  putRowMethodSuccess,
  onLoadingRowMethodStart,
  onLoadingRowMethodFail,
  deleteRowMethodSuccess,
} = rowMethodSlice.actions;
export default rowMethodSlice.reducer;

export const rowMethodReducerSelector = (state) => state.entitiesReducer[rowMethodSlice.name];

export const rowMethodSelectors = rowMethodAdapter.getSelectors(
  (state) => state.entitiesReducer[rowMethodSlice.name],
);
