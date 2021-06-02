import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { cropEntitiesSelector } from './cropSlice';
import { lastActiveDatetimeSelector } from './userLogSlice';
import { pick } from '../util';
import { cropLocationEntitiesSelector } from './locationSlice';
import { cropVarietiesSelector, cropVarietyEntitiesSelector } from './cropVarietySlice';
import { cropCatalogueFilterDateSelector } from './filterSlice';

const getManagementPlan = (obj) => {
  return pick(obj, [
    'area_used',
    'bed_config',
    'crop_variety_id',
    'end_date',
    'estimated_production',
    'estimated_revenue',
    'management_plan_id',
    'is_by_bed',
    'location_id',
    'start_date',
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
    selectManagementPlanSuccess(state, { payload: managementPlan_id }) {
      state.managementPlan_id = managementPlan_id;
    },
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

export const managementPlansSelector = createSelector(
  [
    managementPlanSelectors.selectAll,
    cropLocationEntitiesSelector,
    cropEntitiesSelector,
    cropVarietyEntitiesSelector,
    loginSelector,
  ],
  (managementPlans, cropLocationEntities, cropEntities, cropVarietyEntities, { farm_id }) => {
    const managementPlansOfCurrentFarm = managementPlans.filter(
      (managementPlan) => cropLocationEntities[managementPlan.location_id]?.farm_id === farm_id,
    );
    return managementPlansOfCurrentFarm.map((managementPlan) => {
      const crop_variety = cropVarietyEntities[managementPlan.crop_variety_id];
      const crop = cropEntities[crop_variety.crop_id];
      return {
        ...crop,
        ...crop_variety,
        location: cropLocationEntities[managementPlan.location_id],
        ...managementPlan,
        crop,
        crop_variety,
      };
    });
  },
);

export const expiredManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getExpiredManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const getExpiredManagementPlans = (managementPlans, time) =>
  managementPlans.filter((managementPlan) => new Date(managementPlan.end_date).getTime() < time);

export const currentAndPlannedManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return managementPlans.filter(
      (managementPlan) => new Date(managementPlan.end_date).getTime() >= lastActiveDatetime,
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
      new Date(managementPlan.end_date).getTime() >= time &&
      new Date(managementPlan.start_date).getTime() <= time,
  );
};

export const plannedManagementPlansSelector = createSelector(
  [managementPlansSelector, lastActiveDatetimeSelector],
  (managementPlans, lastActiveDatetime) => {
    return getPlannedManagementPlans(managementPlans, lastActiveDatetime);
  },
);

export const getPlannedManagementPlans = (managementPlans, time) =>
  managementPlans.filter((managementPlan) => new Date(managementPlan.start_date).getTime() > time);

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

const getUniqueEntities = (entities, key) => {
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
