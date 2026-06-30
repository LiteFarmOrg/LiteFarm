/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart, onLoadingSuccess } from '../../userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../../../util/pick';

const soilSampleTaskProperties = [
  'task_id',
  'samples_per_location',
  'sample_depths',
  'sample_depths_unit',
  'sampling_tool',
];

const getSoilSampleTask = (task) => {
  return pick(task, soilSampleTaskProperties);
};

const upsertOneSoilSampleTask = (state, { payload: task }) => {
  soilSampleTaskAdapter.upsertOne(state, getSoilSampleTask(task));
};
const upsertManySoilSampleTask = (state, { payload: tasks }) => {
  soilSampleTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getSoilSampleTask(task)),
  );
  onLoadingSuccess(state);
};
const setAllSoilSampleTask = (state, { payload: tasks }) => {
  soilSampleTaskAdapter.setAll(
    state,
    tasks.map((task) => getSoilSampleTask(task)),
  );
  onLoadingSuccess(state);
};

const soilSampleTaskAdapter = createEntityAdapter({
  selectId: (soilSampleTask) => soilSampleTask.task_id,
});

const soilSampleTaskSlice = createSlice({
  name: 'soilSampleTaskReducer',
  initialState: soilSampleTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingSoilSampleTaskStart: onLoadingStart,
    onLoadingSoilSampleTaskFail: onLoadingFail,
    getSoilSampleTasksSuccess: upsertManySoilSampleTask,
    getAllSoilSampleTasksSuccess: setAllSoilSampleTask,
    postSoilSampleTaskSuccess: upsertOneSoilSampleTask,
    editSoilSampleTaskSuccess: upsertOneSoilSampleTask,
    deleteSoilSampleTaskSuccess: soilSampleTaskAdapter.removeOne,
  },
});
export const {
  getSoilSampleTasksSuccess,
  getAllSoilSampleTasksSuccess,
  postSoilSampleTaskSuccess,
  editSoilSampleTaskSuccess,
  onLoadingSoilSampleTaskStart,
  onLoadingSoilSampleTaskFail,
  deleteSoilSampleTaskSuccess,
} = soilSampleTaskSlice.actions;
export default soilSampleTaskSlice.reducer;

export const soilSampleTaskReducerSelector = (state) =>
  state.entitiesReducer[soilSampleTaskSlice.name];

const soilSampleTaskSelectors = soilSampleTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[soilSampleTaskSlice.name],
);

export const soilSampleTaskEntitiesSelector = soilSampleTaskSelectors.selectEntities;

export const soilSampleTaskStatusSelector = createSelector(
  [soilSampleTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
