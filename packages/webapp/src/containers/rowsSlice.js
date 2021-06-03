import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util';

const getRow = (obj) => {
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
