import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietyEntitiesSelector } from './cropVarietySlice';

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

const rowSelectors = rowAdapter.getSelectors((state) => state.entitiesReducer[rowSlice.name]);

export const rowsSelector = createSelector(
  [
    rowSelectors.selectAll,
    cropLocationEntitiesSelector,
    cropEntitiesSelector,
    cropVarietyEntitiesSelector,
    loginSelector,
  ],
  (rows, cropLocationEntities, cropEntities, cropVarietyEntities, { farm_id }) => {
    const rowsOfCurrentFarm = rows.filter(
      (row) => cropLocationEntities[row.location_id]?.farm_id === farm_id,
    );
    return rowsOfCurrentFarm.map((row) => {
      const crop_variety = cropVarietyEntities[row.crop_variety_id];
      const crop = cropEntities[crop_variety.crop_id];
      return {
        ...crop,
        ...crop_variety,
        location: cropLocationEntities[row.location_id],
        ...row,
        crop,
        crop_variety,
      };
    });
  },
);
