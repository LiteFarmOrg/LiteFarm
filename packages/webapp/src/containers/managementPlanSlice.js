import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietiesSelector, cropVarietyEntitiesSelector } from './cropVarietySlice';
import { cropCatalogueFilterDateSelector } from './filterSlice';
import { containerSelectors } from './containerSlice';
import { bedSelectors } from './bedsSlice';
import { rowSelectors } from './rowsSlice';
import { broadcastSelectors } from './broadcastSlice';
import { transplantContainerSelectors } from './transplantContainerSlice';

export const getManagementPlan = (obj) => {
  return pick(obj, [
    'crop_variety_id',
    'for_cover',
    'germination_date',
    'germination_days',
    'harvest_date',
    'harvest_days',
    'management_plan_id',
    'needs_transplant',
    'seed_date',
    'termination_date',
    'termination_days',
    'transplant_date',
    'transplant_days',
  ]);
};

const addOneManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  managementPlanAdapter.upsertOne(state, getManagementPlan(payload));
};

const updateOneManagementPlan = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  managementPlanAdapter.upsertOne(state, getManagementPlan(payload));
};

const addManyManagementPlan = (state, { payload: managementPlans }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  managementPlanAdapter.upsertMany(
    state,
    managementPlans.map((managementPlan) => getManagementPlan(managementPlan)),
  );
};

const managementPlanAdapter = createEntityAdapter({
  selectId: (managementPlan) => managementPlan.management_plan_id,
});

const managementPlanSlice = createSlice({
  name: 'managementPlanReducer',
  initialState: managementPlanAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingManagementPlanStart: onLoadingStart,
    onLoadingManagementPlanFail: onLoadingFail,
    getManagementPlansSuccess: addManyManagementPlan,
    postManagementPlanSuccess: addOneManagementPlan,
    putManagementPlanSuccess(state, { payload: managementPlan }) {
      managementPlanAdapter.updateOne(state, {
        changes: managementPlan,
        id: managementPlan.management_plan_id,
      });
    },
    deleteManagementPlanSuccess: managementPlanAdapter.removeOne,
  },
});
export const {
  getManagementPlansSuccess,
  postManagementPlanSuccess,
  putManagementPlanSuccess,
  onLoadingManagementPlanStart,
  onLoadingManagementPlanFail,
  deleteManagementPlanSuccess,
} = managementPlanSlice.actions;
export default managementPlanSlice.reducer;

export const managementPlanReducerSelector = (state) =>
  state.entitiesReducer[managementPlanSlice.name];

const managementPlanSelectors = managementPlanAdapter.getSelectors(
  (state) => state.entitiesReducer[managementPlanSlice.name],
);

const getPlantingTypeSelector = (plantingTypeEntitySelector) =>
  createSelector(
    [
      managementPlanSelectors.selectEntities,
      plantingTypeEntitySelector,
      transplantContainerSelectors.selectEntities,
      cropLocationEntitiesSelector,
      cropEntitiesSelector,
      cropVarietyEntitiesSelector,
    ],
    (
      managementPlanEntities,
      plantingTypeEntities,
      transplantContainerEntities,
      cropLocationEntities,
      cropEntities,
      cropVarietyEntities,
    ) => {
      let entities = {};
      for (const management_plan_id in plantingTypeEntities) {
        const plantingType = plantingTypeEntities[management_plan_id];
        const management_plan = managementPlanEntities[management_plan_id];
        const crop_variety = cropVarietyEntities[management_plan.crop_variety_id];
        const crop = cropEntities[crop_variety.crop_id];
        const location = cropLocationEntities[plantingType.location_id];
        const transplant_container = transplantContainerEntities[management_plan_id];
        entities[management_plan_id] = {
          ...crop,
          ...crop_variety,
          ...plantingType,
          ...management_plan,
          crop,
          crop_variety,
          location,
          transplant_container,
          [plantingType.planting_type.toLowerCase()]: plantingType,
        };
      }
      return entities;
    },
  );

export const containerEntitiesSelector = getPlantingTypeSelector(containerSelectors.selectEntities);
export const containersSelector = createSelector([containerEntitiesSelector], (containerEntities) =>
  Object.values(containerEntities),
);
export const bedEntitiesSelector = getPlantingTypeSelector(bedSelectors.selectEntities);
export const bedsSelector = createSelector([bedEntitiesSelector], (bedEntities) =>
  Object.values(bedEntities),
);
export const rowEntitiesSelector = getPlantingTypeSelector(rowSelectors.selectEntities);
export const rowsSelector = createSelector([rowEntitiesSelector], (rowEntities) =>
  Object.values(rowEntities),
);
export const broadcastEntitiesSelector = getPlantingTypeSelector(broadcastSelectors.selectEntities);
export const broadcastsSelector = createSelector([broadcastEntitiesSelector], (broadcastEntities) =>
  Object.values(broadcastEntities),
);

const managementPlanEntitiesSelector = createSelector(
  [containerEntitiesSelector, bedEntitiesSelector, rowEntitiesSelector, broadcastEntitiesSelector],
  (containerEntities, bedEntities, rowEntities, broadcastEntities) => ({
    ...containerEntities,
    ...bedEntities,
    ...rowEntities,
    ...broadcastEntities,
  }),
);

export const managementPlansSelector = createSelector(
  [managementPlanEntitiesSelector, loginSelector],
  (managementPlanEntities, { farm_id }) =>
    Object.values(managementPlanEntities).filter(
      (managementPlan) => managementPlan.farm_id === farm_id,
    ),
);

export const expiredManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getExpiredManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const getExpiredManagementPlans = (managementPlans, time) =>
  managementPlans.filter(
    (managementPlan) => new Date(managementPlan.harvest_date).getTime() < time,
  );

export const currentAndPlannedManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return managementPlans.filter(
      (managementPlan) => new Date(managementPlan.harvest_date).getTime() >= lastActiveDatetime,
    );
  },
);

export const currentManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getCurrentManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const getCurrentManagementPlans = (managementPlans, time) => {
  return managementPlans.filter(
    (managementPlan) =>
      new Date(managementPlan.harvest_date).getTime() >= time &&
      new Date(managementPlan.seed_date).getTime() <= time,
  );
};

export const plannedManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getPlannedManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const getPlannedManagementPlans = (managementPlans, time) =>
  managementPlans.filter((managementPlan) => new Date(managementPlan.seed_date).getTime() > time);

export const cropsWithVarietyWithoutManagementPlanSelector = createSelector(
  [managementPlansSelector, cropVarietiesSelector],
  (managementPlans, cropVarieties) => {
    const cropIds = new Set();
    for (const managementPlan of managementPlans) {
      cropIds.add(managementPlan.crop_id);
    }
    return getUniqueEntities(
      cropVarieties.filter((cropVariety) => !cropIds.has(cropVariety.crop_id)),
      'crop_id',
    );
  },
);

export const cropVarietiesWithoutManagementPlanSelector = createSelector(
  [managementPlansSelector, cropVarietiesSelector],
  (managementPlans, cropVarieties) => {
    const cropVarietyIds = new Set();
    for (const managementPlan of managementPlans) {
      cropVarietyIds.add(managementPlan.crop_variety_id);
    }
    return cropVarieties.filter((cropVariety) => !cropVarietyIds.has(cropVariety.crop_variety_id));
  },
);

export const managementPlansByLocationIdSelector = (location_id) =>
  createSelector([() => location_id, managementPlansSelector], (location_id, managementPlans) =>
    managementPlans.filter((managementPlan) => managementPlan.location_id === location_id),
  );

export const expiredManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, expiredManagementPlansSelector],
    (location_id, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.location_id === location_id),
  );
export const currentAndPlannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, currentAndPlannedManagementPlansSelector],
    (location_id, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.location_id === location_id),
  );

export const currentManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, currentManagementPlansSelector],
    (location_id, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.location_id === location_id),
  );

export const plannedManagementPlansByLocationIdSelector = (location_id) =>
  createSelector(
    [() => location_id, plannedManagementPlansSelector],
    (location_id, managementPlans) =>
      managementPlans.filter((managementPlan) => managementPlan.location_id === location_id),
  );

export const managementPlanSelector = managementPlanSelectors.selectById;

export const managementPlanStatusSelector = createSelector(
  [managementPlanReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);

const getManagementPlanLocationsFromManagementPlans = (managementPlans) => {
  const locationEntitiesWithManagementPlans = {};
  for (const managementPlan of managementPlans) {
    if (
      managementPlan.location_id &&
      !locationEntitiesWithManagementPlans.hasOwnProperty(managementPlan.location_id)
    ) {
      locationEntitiesWithManagementPlans[managementPlan.location_id] = managementPlan.location;
    }
  }
  return Object.values(locationEntitiesWithManagementPlans);
};

export const locationsWithManagementPlanSelector = createSelector(
  [managementPlansSelector],
  getManagementPlanLocationsFromManagementPlans,
);

export const locationsWithCurrentAndPlannedManagementPlanSelector = createSelector(
  [currentAndPlannedManagementPlansSelector],
  getManagementPlanLocationsFromManagementPlans,
);

export const managementPlanByCropIdSelector = (crop_id) =>
  createSelector([managementPlansSelector], (managementPlans) => {
    return managementPlans.filter((managementPlan) => managementPlan.crop_id === crop_id);
  });

export const currentManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getCurrentManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const plannedManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getPlannedManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const expiredManagementPlanByCropIdSelector = (crop_id) =>
  createSelector(
    [managementPlanByCropIdSelector(crop_id), cropCatalogueFilterDateSelector],
    (managementPlans, cropCatalogFilterDate) =>
      getExpiredManagementPlans(managementPlans, new Date(cropCatalogFilterDate).getTime()),
  );
export const cropVarietiesWithoutManagementPlanByCropIdSelector = (crop_id) =>
  createSelector([cropVarietiesWithoutManagementPlanSelector], (cropVarieties) =>
    cropVarieties.filter((cropVariety) => cropVariety.crop_id === crop_id),
  );

export const getUniqueEntities = (entities, key) => {
  const entitiesByKey = {};
  for (const entity of entities) {
    entitiesByKey[entity[key]] = entity;
  }
  return Object.values(entitiesByKey);
};

export const currentCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([currentManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );
export const plannedCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([plannedManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );
export const expiredCropVarietiesByCropIdSelector = (crop_id) =>
  createSelector([expiredManagementPlanByCropIdSelector(crop_id)], (managementPlans) =>
    getUniqueEntities(managementPlans, 'crop_variety_id'),
  );
