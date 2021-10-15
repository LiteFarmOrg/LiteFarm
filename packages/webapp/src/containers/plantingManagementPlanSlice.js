import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';

import { cropLocationEntitiesSelector } from './locationSlice';

import { pick } from '../util/pick';
import { bedMethodSelectors } from './bedMethodSlice';
import { rowMethodSelectors } from './rowMethodSlice';
import { containerMethodSelectors } from './containerMethodSlice';
import { broadcastMethodSelectors } from './broadcastMethodSlice';

export const plantingManagementPlanProperties = [
  'estimated_seeds',
  'estimated_seeds_unit',
  'is_final_planting_management_plan',
  'is_planting_method_known',
  'location_id',
  'management_plan_id',
  'notes',
  'pin_coordinate',
  'planting_management_plan_id',
  'planting_method',
];

export const getPlantingManagementPlan = (obj) => {
  return pick(obj, plantingManagementPlanProperties);
};

const addOnePlantingManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  plantingManagementPlanAdapter.upsertOne(state, getPlantingManagementPlan(payload));
};

const updateOnePlantingManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  plantingManagementPlanAdapter.upsertOne(state, getPlantingManagementPlan(payload));
};

const addManyPlantingManagementPlan = (state, { payload: plantingManagementPlans }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  plantingManagementPlanAdapter.upsertMany(
    state,
    plantingManagementPlans.map((plantingManagementPlan) =>
      getPlantingManagementPlan(plantingManagementPlan),
    ),
  );
};

const plantingManagementPlanAdapter = createEntityAdapter({
  selectId: (plantingManagementPlan) => plantingManagementPlan.planting_management_plan_id,
});

const plantingManagementPlanSlice = createSlice({
  name: 'plantingManagementPlanReducer',
  initialState: plantingManagementPlanAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingPlantingManagementPlanStart: onLoadingStart,
    onLoadingPlantingManagementPlanFail: onLoadingFail,
    getPlantingManagementPlansSuccess: addManyPlantingManagementPlan,
    deletePlantingManagementPlanSuccess: plantingManagementPlanAdapter.removeOne,
  },
});
export const {
  getPlantingManagementPlansSuccess,
  onLoadingPlantingManagementPlanStart,
  onLoadingPlantingManagementPlanFail,
  deletePlantingManagementPlanSuccess,
} = plantingManagementPlanSlice.actions;
export default plantingManagementPlanSlice.reducer;

export const plantingManagementPlanReducerSelector = (state) =>
  state.entitiesReducer[plantingManagementPlanSlice.name];

const plantingManagementPlanSelectors = plantingManagementPlanAdapter.getSelectors(
  (state) => state.entitiesReducer[plantingManagementPlanSlice.name],
);

/**
 * {
 *
 *    planting_management_plan_id:{
 *
 *    ...planting_management_plan,
 *
 *    planting_method: 'BROADCAST_METHOD",
 *
 *    broadcast_method
 *
 *    location_id
 *
 *    location
 *
 *    }
 *
 *    planting_management_plan_id:{
 *
 *    ...planting_management_plan,
 *
 *    planting_method: undefined
 *
 *    location_id: undefined
 *
 *    }
 *
 *  }
 *
 */
export const plantingManagementPlanEntitiesSelector = createSelector(
  [
    plantingManagementPlanSelectors.selectAll,
    bedMethodSelectors.selectEntities,
    rowMethodSelectors.selectEntities,
    containerMethodSelectors.selectEntities,
    broadcastMethodSelectors.selectEntities,
    cropLocationEntitiesSelector,
  ],
  (
    plantingManagementPlans,
    bedMethodEntities,
    rowMethodEntities,
    containerMethodEntities,
    broadcastMethodEntities,
    cropLocationEntities,
  ) => {
    const entities = {};
    const plantingMethodEntityMap = {
      broadcast_method: broadcastMethodEntities,
      container_method: containerMethodEntities,
      bed_method: bedMethodEntities,
      row_method: rowMethodEntities,
    };
    for (const planting_management_plan of plantingManagementPlans) {
      const {
        planting_management_plan_id,
        planting_method,
        location_id,
      } = planting_management_plan;
      entities[planting_management_plan_id] = { ...planting_management_plan };
      const plantingMethodLowercase = planting_method?.toLowerCase();
      plantingMethodLowercase &&
        (entities[planting_management_plan_id][plantingMethodLowercase] =
          plantingMethodEntityMap[plantingMethodLowercase][planting_management_plan_id]);
      location_id &&
        (entities[planting_management_plan_id].location = cropLocationEntities[location_id]);
    }
    return entities;
  },
);
/**
 * {
 * management_plan_id: [...planting_management_plans]
 * }
 */
export const plantingManagementPlanEntitiesByManagementPlanIdSelector = createSelector(
  [plantingManagementPlanEntitiesSelector],
  (plantingManagementPlanEntities) => {
    const entitiesByManagementPlanId = {};
    for (const planting_management_plan_id in plantingManagementPlanEntities) {
      const plantingManagementPlan = plantingManagementPlanEntities[planting_management_plan_id];
      const { management_plan_id } = plantingManagementPlan;
      if (entitiesByManagementPlanId[management_plan_id]) {
        entitiesByManagementPlanId[management_plan_id].push(plantingManagementPlan);
      } else {
        entitiesByManagementPlanId[management_plan_id] = [plantingManagementPlan];
      }
    }
    return entitiesByManagementPlanId;
  },
);
