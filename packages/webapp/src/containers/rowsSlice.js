import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { cropManagementPlanProperties } from './broadcastSlice';
import { pick } from '../util/pick';

export const rowProperties = [
  "management_plan_id",
  "same_length",
  "number_of_rows",
  "row_length",
  "row_length_unit",
  "plant_spacing",
  "plant_spacing_unit",
  "total_rows_length",
  "total_rows_length_unit",
  "estimated_yield",
  "estimated_yield_unit",
  "estimated_seeds",
  "estimated_seeds_unit",
  "specify_rows",
  "planting_depth",
  "planting_depth_unit",
  "row_width",
  "row_width_unit",
  "row_spacing",
  "row_spacing_unit",
  "planting_notes",
];
const getRow = (obj) => {
  return pick(obj, [...cropManagementPlanProperties, ...rowProperties]);
};

const addOneRow = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  rowAdapter.upsertOne(state, getRow(payload));
};

const updateOneRow = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  rowAdapter.upsertOne(state, getRow(payload));
};

const addManyRow = (state, { payload: rows }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  rowAdapter.upsertMany(
    state,
    rows.map((row) => getRow(row)),
  );
};

const rowAdapter = createEntityAdapter({
  selectId: (row) => row.management_plan_id,
});

const rowSlice = createSlice({
  name: 'rowsReducer',
  initialState: rowAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingRowStart: onLoadingStart,
    onLoadingRowFail: onLoadingFail,
    getRowsSuccess: addManyRow,
    postRowSuccess: addOneRow,
    putRowSuccess(state, { payload: row }) {
      rowAdapter.updateOne(state, {
        changes: row,
        id: row.management_plan_id,
      });
    },
    deleteRowSuccess: rowAdapter.removeOne,
  },
});
export const {
  getRowsSuccess,
  postRowSuccess,
  putRowSuccess,
  onLoadingRowStart,
  onLoadingRowFail,
  deleteRowSuccess,
} = rowSlice.actions;
export default rowSlice.reducer;

export const rowReducerSelector = (state) => state.entitiesReducer[rowSlice.name];

export const rowSelectors = rowAdapter.getSelectors(
  (state) => state.entitiesReducer[rowSlice.name],
);
