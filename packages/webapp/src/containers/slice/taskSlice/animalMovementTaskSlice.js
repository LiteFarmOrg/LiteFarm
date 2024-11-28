/*
 *  Copyright 2024 LiteFarm.org
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

const animalMovementTaskProperties = ['task_id', 'purpose_relationships'];

const getAnimalMovementTask = (task) => {
  return pick(task, animalMovementTaskProperties);
};

const upsertOneAnimalMovementTask = (state, { payload: task }) => {
  animalMovementTaskAdapter.upsertOne(state, getAnimalMovementTask(task));
};
const upsertManyAnimalMovementTask = (state, { payload: tasks }) => {
  animalMovementTaskAdapter.upsertMany(
    state,
    tasks.map((task) => getAnimalMovementTask(task)),
  );
  onLoadingSuccess(state);
};

const animalMovementTaskAdapter = createEntityAdapter({
  selectId: (animalMovementTask) => animalMovementTask.task_id,
});

const animalMovementTaskSlice = createSlice({
  name: 'animalMovementTaskReducer',
  initialState: animalMovementTaskAdapter.getInitialState({
    loading: false,
    error: undefined,
    task_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingAnimalMovementTaskStart: onLoadingStart,
    onLoadingAnimalMovementTaskFail: onLoadingFail,
    getAnimalMovementTasksSuccess: upsertManyAnimalMovementTask,
    postAnimalMovementTaskSuccess: upsertOneAnimalMovementTask,
    editAnimalMovementTaskSuccess: upsertOneAnimalMovementTask,
    deleteAnimalMovementTaskSuccess: animalMovementTaskAdapter.removeOne,
  },
});
export const {
  getAnimalMovementTasksSuccess,
  postAnimalMovementTaskSuccess,
  editAnimalMovementTaskSuccess,
  onLoadingAnimalMovementTaskStart,
  onLoadingAnimalMovementTaskFail,
  deleteAnimalMovementTaskSuccess,
} = animalMovementTaskSlice.actions;
export default animalMovementTaskSlice.reducer;

export const animalMovementTaskReducerSelector = (state) =>
  state.entitiesReducer[animalMovementTaskSlice.name];

const animalMovementTaskSelectors = animalMovementTaskAdapter.getSelectors(
  (state) => state.entitiesReducer[animalMovementTaskSlice.name],
);

export const animalMovementTaskEntitiesSelector = animalMovementTaskSelectors.selectEntities;

export const animalMovementTaskStatusSelector = createSelector(
  [animalMovementTaskReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
